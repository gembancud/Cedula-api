import { Static, Type } from "@sinclair/typebox";

const BaseVerify = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String({ format: "email" }),
  links: Type.Array(
    Type.Object({
      link: Type.String(),
      site: Type.String(),
    })
  ),
  org: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  documents: Type.Array(Type.String()),
  status: Type.String(),
  evaluation: Type.String(),
  evaluators: Type.Array(Type.String()),
});

export type LinkType = {
  link: string;
  site: string;
};

const VerifyGetResponse = Type.Array(BaseVerify);

const VerifyGetOneParams = Type.Object({
  id: Type.String(),
});

const VerifyGetOneResponse = BaseVerify;
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
