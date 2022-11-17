import { Schema } from "mongoose";

export interface Badge {
  _id: string;
  name: string;
  org: string;
  link: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export const BadgeSchema = new Schema<Badge>({
  name: { type: String, required: true },
  org: { type: String, required: true },
  link: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
