import mongoose, { Schema, models, model, Types } from "mongoose";

export interface IProduct {
  externalId: string;
  categoryId: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    externalId: { type: String, required: true, unique: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    imageUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

ProductSchema.index({ categoryId: 1 });

export const Product =
  models.Product ?? model<IProduct>("Product", ProductSchema);
