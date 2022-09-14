import { Schema } from "mongoose";

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface Registration {
  _id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  applicant_address: string;
  applicant_birthdate: string;
  createdAt: Date;
}
