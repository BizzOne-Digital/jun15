import { getAdminSession } from "@/lib/auth";
import {
  orderEventBus,
  PAID_ORDER_EVENT,
  type PaidOrderEvent,
} from "@/lib/order-events";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let listener: ((payload: PaidOrderEvent) => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send({ type: "connected" });

      listener = (payload: PaidOrderEvent) => {
        send({ type: "order_paid", ...payload });
      };
      orderEventBus.on(PAID_ORDER_EVENT, listener);

      const heartbeat = setInterval(() => {
        send({ type: "ping" });
      }, 25000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        if (listener) {
          orderEventBus.off(PAID_ORDER_EVENT, listener);
        }
        controller.close();
      });
    },
    cancel() {
      if (listener) {
        orderEventBus.off(PAID_ORDER_EVENT, listener);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
