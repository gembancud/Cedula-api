import { Schema } from "mongoose";

export interface Org {
  _id: string;
  name: string;
  image: string;
  badge: string;
  description: string;
  requirements: string;
  createdAt: Date;
  access: string;
  evaluatorcount: number;
  website: string;
}

export const OrgSchema = new Schema<Org>({
  name: { type: String, required: true, index: true, unique: true },
  image: { type: String, required: true },
  badge: { type: String, required: true },
  description: { type: String },
  requirements: { type: String },
  createdAt: { type: Date, default: Date.now },
  access: { type: String, required: true },
  evaluatorcount: { type: Number, default: 1 },
  website: { type: String },
});
