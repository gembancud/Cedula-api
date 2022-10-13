import { Type, Static } from "@sinclair/typebox";

const EvaluatorGetQuery = Type.Object({
  // org: Type.String(),
});

export const EvaluatorGetOptions = {
  schema: {
    querystring: EvaluatorGetQuery,
  },
};

export type EvaluatorGetQuery = Static<typeof EvaluatorGetQuery>;
