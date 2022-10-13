import { Type, Static } from "@sinclair/typebox";

const EvaluatorPostRequest = Type.Object({
  email: Type.String({ format: "email" }),
  password: Type.String(),
  credential: Type.String(),
  org: Type.String(),
});

const EvaluatorDeleteRequest = Type.Object({
  email: Type.String({ format: "email" }),
  org: Type.String(),
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
  site: Type.String(),
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

const OrgPostRequest = Type.Object({
  name: Type.String(),
  image: Type.String(),
  badge: Type.String(),
  description: Type.String(),
  access: Type.String(),
  evaluatorcount: Type.Number(),
});

export const OrgPostOptions = {
  schema: {
    body: OrgPostRequest,
    response: {
      201: Type.String(),
    },
  },
};

export type OrgPostBody = Static<typeof OrgPostRequest>;
