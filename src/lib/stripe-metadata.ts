import type { IOrder } from "@/models/Order";
import { getAppBaseUrl } from "@/lib/stripe";

/** Shown in Stripe Dashboard on Checkout / Payment so you know which site it came from. */
export function getStripeSiteLabel(): string {
  return (
    process.env.STRIPE_METADATA_SITE_NAME?.trim() ||
    "Royal Garden Restaurant"
  );
}

export function buildStripeOrderMetadata(order: IOrder & { _id: unknown }) {
  const site = getStripeSiteLabel();
  const website = getAppBaseUrl();

  return {
    site_name: site,
    source: "royal-garden-online-ordering",
    website,
    order_id: String(order._id),
    order_number: order.orderNumber,
    customer_name: order.customerName.slice(0, 500),
    customer_phone: order.customerPhone.slice(0, 500),
    customer_email: order.customerEmail.slice(0, 500),
    order_type: order.orderType,
    ...(order.address
      ? { delivery_address: order.address.slice(0, 500) }
      : {}),
    ...(order.notes ? { order_notes: order.notes.slice(0, 500) } : {}),
  };
}
