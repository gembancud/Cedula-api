import { Static, Type } from "@sinclair/typebox";

const org = Type.Object({
  name: Type.String(),
  image: Type.String(),
  badge: Type.String(),
  description: Type.String(),
  requirements: Type.String(),
  createdAt: Type.String(),
  access: Type.String(),
});

const OrgGetResponse = Type.Object({
  orgs: Type.Array(org),
});

export const OrgGetOptions = {
  schema: {
    response: {
      200: OrgGetResponse,
    },
  },
};

export const OrgGetMeOptions = {
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
