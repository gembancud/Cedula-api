import { Schema } from "mongoose";

export interface Profile {
  _id: string;
  name: string;
  email: string;
  links: string;
  contact_number: string;
  fbuid: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ProfileSchema = new Schema<Profile>({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  links: { type: String, required: true },
  contact_number: { type: String, required: true },
  fbuid: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
