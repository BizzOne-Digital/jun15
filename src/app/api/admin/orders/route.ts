import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: String(o._id),
      orderNumber: o.orderNumber,
      status: o.status,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerEmail: o.customerEmail,
      orderType: o.orderType,
      address: o.address,
      notes: o.notes,
      items: o.items,
      subtotal: o.subtotal,
      tax: o.tax,
      total: o.total,
      createdAt: o.createdAt,
    })),
  });
}
