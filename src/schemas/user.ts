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

interface BaseUser {
  _id: string;
  name: string;
  email: string;
  link: string;
  createdAt: Date;
  expiresAt: Date;
  orgs: string[];
}

const BaseUserSchema = new Schema<BaseUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true, unique: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: Date.now },
  orgs: { type: [String], default: [] },
});

export interface FacebookUser extends BaseUser {}

export const FacebookUserSchema = new Schema<FacebookUser>({
  ...BaseUserSchema.obj,
});

export interface TwitterUser extends BaseUser {}

export const TwitterUserSchema = new Schema<TwitterUser>({
  ...BaseUserSchema.obj,
});

export interface RedditUser extends BaseUser {}

export const RedditUserSchema = new Schema<RedditUser>({
  ...BaseUserSchema.obj,
});
