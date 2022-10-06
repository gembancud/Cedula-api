import { Static, Type } from "@sinclair/typebox";

const VerifyGetResponse = Type.Array(
  Type.Object({
    id: Type.String(),
    applicant_name: Type.String(),
    applicant_email: Type.String({ format: "email" }),
    applicant_link: Type.String(),
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
  applicant_link: Type.String(),
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

export type VerifyGetOneParams = Static<typeof VerifyGetOneParams>;
