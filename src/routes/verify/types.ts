import { Static, Type } from "@sinclair/typebox";

const VerifyGetResponse = Type.Array(
  Type.Object({
    id: Type.String(),
    applicant_name: Type.String(),
    applicant_email: Type.String({ format: "email" }),
    applicant_links: Type.String(),
    org: Type.String(),
    createdAt: Type.String(),
    updatedAt: Type.String(),
    documents: Type.Array(Type.String()),
    status: Type.String(),
    evaluation: Type.String(),
    evaluators: Type.Array(Type.String()),
  })
);

const VerifyGetOneParams = Type.Object({
  id: Type.String(),
});

const VerifyGetOneResponse = Type.Object({
  id: Type.String(),
  applicant_name: Type.String(),
  applicant_email: Type.String({ format: "email" }),
  applicant_links: Type.String(),
  org: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  documents: Type.Array(Type.String()),
  status: Type.String(),
  evaluation: Type.String(),
  evaluators: Type.Array(Type.String()),
});

export const VerifyGetOptions = {
  schema: {
    response: {
      200: VerifyGetResponse,
    },
  },
};
export const VerifyGetOneOptions = {
  schema: {
    params: VerifyGetOneParams,
    response: {
      200: VerifyGetOneResponse,
    },
  },
};

export const VerifyPostRequest = Type.Object({
  email: Type.String({ format: "email" }),
  org: Type.String(),
  evaluation: Type.String(),
  comment: Type.String(),
});

export const VerifyPostOptions = {
  schema: {
    body: VerifyPostRequest,
    response: {
      200: VerifyGetOneResponse,
    },
  },
};

export type VerifyGetOneParams = Static<typeof VerifyGetOneParams>;
export type VerifyPostBody = Static<typeof VerifyPostRequest>;
