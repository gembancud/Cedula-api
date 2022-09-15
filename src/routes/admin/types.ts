import { Type, Static } from "@sinclair/typebox";

const EvaluatorRequest = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String(),
  credential: Type.String(),
});

const DeleteEvaluatorRequest = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String(),
});

export const EvaluatorOptions = {
  schema: {
    body: EvaluatorRequest,
    response: {
      201: Type.String(),
    },
  },
};

export const DeleteEvaluatorOptions = {
  schema: {
    body: DeleteEvaluatorRequest,
    response: {
      200: Type.Object({
        message: Type.String(),
      }),
    },
  },
};

export type EvaluatorBody = Static<typeof EvaluatorRequest>;
export type DeleteEvaluatorBody = Static<typeof DeleteEvaluatorRequest>;
