import "dotenv/config";
import { config } from "dotenv";
import { buildStripeOrderMetadata, getStripeSiteLabel } from "../src/lib/stripe-metadata";
import type { IOrder } from "../src/models/Order";

config({ path: ".env.local", override: true });

const STRIPE_KEY_MAX = 40;
const STRIPE_VALUE_MAX = 500;
const STRIPE_MAX_KEYS = 50;

function validateMetadata(
  label: string,
  metadata: Record<string, string>,
): string[] {
  const errors: string[] = [];
  const keys = Object.keys(metadata);

  if (keys.length > STRIPE_MAX_KEYS) {
    errors.push(`${label}: too many keys (${keys.length} > ${STRIPE_MAX_KEYS})`);
  }

  for (const [key, value] of Object.entries(metadata)) {
    if (key.length > STRIPE_KEY_MAX) {
      errors.push(`${label}: key "${key}" exceeds ${STRIPE_KEY_MAX} chars`);
    }
    if (typeof value !== "string") {
      errors.push(`${label}: value for "${key}" must be a string`);
    } else if (value.length > STRIPE_VALUE_MAX) {
      errors.push(
        `${label}: value for "${key}" exceeds ${STRIPE_VALUE_MAX} chars (${value.length})`,
      );
    }
  }

  return errors;
}

const sampleOrder: IOrder & { _id: string } = {
  _id: "507f1f77bcf86cd799439011",
  orderNumber: "RG260312-4821",
  status: "pending",
  customerName: "Test Customer",
  customerPhone: "+1 780-555-0100",
  customerEmail: "test@example.com",
  orderType: "delivery",
  address: "296 Smith St, Hinton, AB",
  notes: "Extra napkins please",
  items: [
    {
      productId: "abc",
      name: "Calamari (Chinese Style)",
      price: 21.5,
      quantity: 2,
    },
  ],
  subtotal: 43,
  tax: 5.59,
  total: 48.59,
};

const longOrder: IOrder & { _id: string } = {
  ...sampleOrder,
  customerName: "X".repeat(600),
  address: "Y".repeat(600),
  notes: "Z".repeat(600),
};

console.log("Site label:", getStripeSiteLabel());

const baseMeta = buildStripeOrderMetadata(sampleOrder);
const longMeta = buildStripeOrderMetadata(longOrder);

const sessionMeta = {
  ...baseMeta,
  orderId: sampleOrder._id,
  orderNumber: sampleOrder.orderNumber,
};

const errors = [
  ...validateMetadata("base metadata", baseMeta),
  ...validateMetadata("long fields (truncated)", longMeta),
  ...validateMetadata("checkout session metadata", sessionMeta),
];

const required = [
  "site_name",
  "source",
  "website",
  "order_id",
  "order_number",
  "customer_name",
  "order_type",
];

for (const key of required) {
  if (!baseMeta[key as keyof typeof baseMeta]) {
    errors.push(`missing required field: ${key}`);
  }
}

if (errors.length > 0) {
  console.error("Metadata validation FAILED:");
  errors.forEach((e) => console.error(" -", e));
  process.exit(1);
}

console.log("Metadata validation OK");
console.log("Sample keys:", Object.keys(sessionMeta).join(", "));

async function liveStripeCheck() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_")) {
    console.log(
      "Live Stripe check skipped (set STRIPE_SECRET_KEY in .env.local to test API)",
    );
    return;
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(key);
  const siteLabel = getStripeSiteLabel();
  const meta = buildStripeOrderMetadata(sampleOrder);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: { name: "Metadata test item" },
          unit_amount: 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      ...meta,
      orderId: sampleOrder._id,
      orderNumber: sampleOrder.orderNumber,
    },
    payment_intent_data: {
      description: `${siteLabel} — Order ${sampleOrder.orderNumber}`,
      metadata: meta,
    },
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
  });

  const retrieved = await stripe.checkout.sessions.retrieve(session.id);
  const piId =
    typeof retrieved.payment_intent === "string"
      ? retrieved.payment_intent
      : retrieved.payment_intent?.id;

  if (!retrieved.metadata?.site_name) {
    throw new Error("Session missing site_name in metadata");
  }
  if (retrieved.metadata.orderId !== sampleOrder._id) {
    throw new Error("Session missing orderId in metadata");
  }

  if (piId) {
    const pi = await stripe.paymentIntents.retrieve(piId);
    if (!pi.metadata?.site_name) {
      throw new Error("PaymentIntent missing site_name in metadata");
    }
  }

  await stripe.checkout.sessions.expire(session.id);
  console.log("Live Stripe API check OK (test session expired)");
}

liveStripeCheck()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Live Stripe check FAILED:", err.message || err);
    process.exit(1);
  });
