import { Schema } from "mongoose";

export interface Registration {
  _id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_links: string;
  contact_number: string;
  org: string;
  fbuid: string;
  createdAt: Date;
  updatedAt: Date;
  documents: string[];
  status: string;
  evaluation: string;
  evaluators: string[];
}

export const RegistrationSchema = new Schema<Registration>({
  applicant_name: { type: String, required: true },
  applicant_email: { type: String, required: true },
  applicant_links: { type: String, required: true },
  contact_number: { type: String, required: true },
  org: { type: String, required: true },
  fbuid: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  documents: { type: [String] },
  status: { type: String, default: "pending" },
  evaluation: { type: String, default: "" },
  evaluators: { type: [String] },
});
