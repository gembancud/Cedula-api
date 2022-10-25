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
