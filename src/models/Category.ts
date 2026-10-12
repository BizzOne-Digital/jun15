import mongoose, { Schema, models, model } from "mongoose";

export interface ICategory {
  externalId: string;
  name: string;
  sortOrder: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    externalId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Category =
  models.Category ?? model<ICategory>("Category", CategorySchema);
