import mongoose, { Schema, models, model } from "mongoose";

export type OrderStatus = "pending" | "paid" | "cancelled";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface IOrder {
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: "pickup" | "delivery";
  address?: string;
  notes?: string;
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  stripeSessionId?: string;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    imageUrl: String,
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, required: true },
    orderType: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
    address: String,
    notes: String,
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    stripeSessionId: { type: String, index: true },
  },
  { timestamps: true },
);

OrderSchema.index({ status: 1, createdAt: -1 });

export const Order = models.Order ?? model<IOrder>("Order", OrderSchema);
