import { Type, Static } from "@sinclair/typebox";

const EvaluatorPostRequest = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String(),
  credential: Type.String(),
});

const EvaluatorDeleteRequest = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String(),
});

export const EvaluatorPostOptions = {
  schema: {
    body: EvaluatorPostRequest,
    response: {
      201: Type.String(),
    },
  },
};

export const EvaluatorDeleteOptions = {
  schema: {
    body: EvaluatorDeleteRequest,
    response: {
      200: Type.Object({
        message: Type.String(),
      }),
    },
  },
};

export type EvaluatorPostBody = Static<typeof EvaluatorPostRequest>;
export type EvaluatorDeleteBody = Static<typeof EvaluatorDeleteRequest>;

const TagPostRequest = Type.Object({
  password: Type.String(),
  label: Type.String(),
  tag: Type.String(),
});

export const TagPostOptions = {
  schema: {
    body: TagPostRequest,
    response: {
      201: Type.String(),
    },
  },
};

export type TagPostBody = Static<typeof TagPostRequest>;
