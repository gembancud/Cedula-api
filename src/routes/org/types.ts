import { Type } from "@sinclair/typebox";

const org = Type.Object({
  name: Type.String(),
  image: Type.String(),
  badge: Type.String(),
  description: Type.String(),
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
