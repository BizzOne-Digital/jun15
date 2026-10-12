import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getAppBaseUrl, getStripe } from "@/lib/stripe";
import {
  buildStripeOrderMetadata,
  getStripeSiteLabel,
} from "@/lib/stripe-metadata";

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status === "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 });
    }

    const stripe = getStripe();
    const baseUrl = getAppBaseUrl();

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: "cad",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    if (order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: "Tax (13%)",
          },
          unit_amount: Math.round(order.tax * 100),
        },
        quantity: 1,
      });
    }

    const stripeMetadata = buildStripeOrderMetadata(order);
    const siteLabel = getStripeSiteLabel();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customerEmail,
      line_items: lineItems,
      metadata: {
        ...stripeMetadata,
        orderId: String(order._id),
        orderNumber: order.orderNumber,
      },
      payment_intent_data: {
        description: `${siteLabel} — Order ${order.orderNumber}`,
        metadata: stripeMetadata,
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?checkout=cancelled`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not create Stripe session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "Stripe checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
