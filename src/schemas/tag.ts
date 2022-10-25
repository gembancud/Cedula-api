import { Schema } from "mongoose";

export interface Tag {
  _id: string;
  site: string;
  label: string;
  tag: string;
  updatedAt: Date;
}

export const TagSchema = new Schema<Tag>({
  label: { type: String, required: true, unique: true },
  site: { type: String, required: true },
  tag: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});
