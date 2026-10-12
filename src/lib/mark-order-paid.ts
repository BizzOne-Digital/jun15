import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { orderEventBus, PAID_ORDER_EVENT } from "@/lib/order-events";

export async function markOrderPaid(orderId: string) {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) {
    return null;
  }
  if (order.status === "paid") {
    return order;
  }

  order.status = "paid";
  await order.save();

  orderEventBus.emit(PAID_ORDER_EVENT, {
    orderId: String(order._id),
    orderNumber: order.orderNumber,
    total: order.total,
    customerName: order.customerName,
  });

  return order;
}
