import { Static, Type } from "@sinclair/typebox";

export const org = {
  name: Type.String(),
  image: Type.String(),
  badge: Type.String(),
  description: Type.String(),
  requirements: Type.String(),
  createdAt: Type.String(),
  access: Type.String(),
  website: Type.String(),
};

const OrgGetResponse = Type.Object({
  orgs: Type.Array(Type.Object(org)),
});

export const OrgGetOptions = {
  schema: {
    response: {
      200: OrgGetResponse,
    },
  },
};

const OrgPostRequest = Type.Object({
  password: Type.String(),
  name: Type.String(),
  image: Type.String(),
  badge: Type.String(),
  description: Type.String(),
  requirements: Type.String(),
  access: Type.String(),
  website: Type.String(),
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
