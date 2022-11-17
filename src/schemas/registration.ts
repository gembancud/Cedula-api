import { Schema } from "mongoose";

export interface Registration {
  _id: string;
  email: string;
  org: string;
  badges: object[];
  active_badge: string;
  createdAt: Date;
  updatedAt: Date;
  documents: string[];
  status: string;
  evaluation: string;
  evaluators: string[];
}

export const RegistrationSchema = new Schema<Registration>({
  email: { type: String, required: true },
  org: { type: String, required: true },
  badges: { type: [Object], required: true },
  active_badge: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  documents: { type: [String] },
  status: { type: String, default: "pending" },
  evaluation: { type: String, default: "0" },
  evaluators: { type: [String] },
});
