import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { calcTotals, generateOrderNumber } from "@/lib/orders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      orderType,
      address,
      notes,
      items,
    } = body;

    if (
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const subtotal = items.reduce(
      (sum: number, i: { price: number; quantity: number }) =>
        sum + i.price * i.quantity,
      0,
    );
    const { tax, total } = calcTotals(subtotal);

    await connectDB();
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      status: "pending",
      customerName,
      customerPhone,
      customerEmail,
      orderType: orderType === "delivery" ? "delivery" : "pickup",
      address: orderType === "delivery" ? address : undefined,
      notes,
      items,
      subtotal,
      tax,
      total,
    });

    return NextResponse.json({
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      total: order.total,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Could not create order" },
      { status: 500 },
    );
  }
}
