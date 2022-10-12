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
  orgs: string[];
}

export const FacebookUserSchema = new Schema<FacebookUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true, unique: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: Date.now },
  orgs: { type: [String], default: [] },
});

export interface TwitterUser {
  _id: string;
  name: string;
  email: string;
  link: string;
  createdAt: Date;
  expiresAt: Date;
  orgs: string[];
}

export const TwitterUserSchema = new Schema<TwitterUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true, unique: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: Date.now },
  orgs: { type: [String], default: [] },
});

export interface Registration {
  _id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_links: string;
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
  org: { type: String, required: true },
  fbuid: { type: String, required: true },
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
  org: string;
}

export const EvaluatorSchema = new Schema<Evaluator>({
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  credential: { type: String, required: true },
  org: { type: String, required: true },
});

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

export interface Org {
  _id: string;
  name: string;
  description: string;
  createdAt: Date;
  access: string;
  evaluatorcount: number;
}

export const OrgSchema = new Schema<Org>({
  name: { type: String, required: true, index: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  access: { type: String, required: true },
  evaluatorcount: { type: Number, default: 1 },
});
