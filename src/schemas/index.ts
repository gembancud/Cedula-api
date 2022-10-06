import { Schema } from "mongoose";

export interface User {
  _id: string;
  name: string;
  email: string;
  link: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true, unique: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export interface FacebookUser {
  _id: string;
  name: string;
  email: string;
  link: string;
  createdAt: Date;
  expiresAt: Date;
}

export const FacebookUserSchema = new Schema<FacebookUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true, unique: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: Date.now },
});

export interface Registration {
  _id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_link: string;
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
  applicant_email: { type: String, required: true, index: true, unique: true },
  applicant_link: { type: String, required: true },
  fbuid: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  documents: { type: [String] },
  status: { type: String, default: "pending" },
  evaluation: { type: String, default: "" },
  evaluators: { type: [String] },
});

export interface Evaluator {
  _id: string;
  email: string;
  createdAt: Date;
  credential: string;
}

export const EvaluatorSchema = new Schema<Evaluator>({
  email: { type: String, required: true, index: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  credential: { type: String, required: true },
});

export interface Tag {
  _id: string;
  label: string;
  tag: string;
  updatedAt: Date;
}

export const TagSchema = new Schema<Tag>({
  label: { type: String, required: true, index: true, unique: true },
  tag: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});
