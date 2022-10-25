import { Schema } from "mongoose";

export interface Evaluation {
  _id: string;
  name: string;
  email: string;
  org: string;
  createdAt: Date;
  updatedAt: Date;
  evaluator: string;
  evaluation: string;
  comments: string;
}

export const EvaluationSchema = new Schema<Evaluation>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  org: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  evaluator: { type: String, required: true },
  evaluation: { type: String, required: true },
  comments: { type: String },
});
