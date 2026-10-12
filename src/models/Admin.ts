import mongoose, { Schema, models, model } from "mongoose";

export interface IAdmin {
  email: string;
  passwordHash: string;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const Admin = models.Admin ?? model<IAdmin>("Admin", AdminSchema);
