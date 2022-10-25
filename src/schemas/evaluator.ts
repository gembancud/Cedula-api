import { Schema } from "mongoose";

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
