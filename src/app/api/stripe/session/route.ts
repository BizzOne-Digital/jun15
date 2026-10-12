import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/mark-order-paid";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "session_id required" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const orderId = session.metadata?.orderId;
    const orderNumber = session.metadata?.orderNumber;

    if (
      session.payment_status === "paid" &&
      orderId
    ) {
      await markOrderPaid(orderId);
    }

    return NextResponse.json({
      paid: session.payment_status === "paid",
      orderNumber: orderNumber ?? null,
      orderId: orderId ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not verify payment" },
      { status: 500 },
    );
  }
}
