import { Static, Type } from "@sinclair/typebox";

const BaseBadge = {
  name: Type.String(),
  org: Type.String(),
  link: Type.String(),
};

const FullBadge = {
  ...BaseBadge,
  description: Type.String(),
};

const BadgePostResponse = Type.Object(FullBadge);

const BadgePostRequest = Type.Object({
  password: Type.String(),
  ...FullBadge,
});

export const BadgePostOptions = {
  schema: {
    body: BadgePostRequest,
    response: {
      200: BadgePostResponse,
    },
  },
};

const BadgeOfOrgParams = Type.Object({
  org: Type.String(),
});

const BadgeOfOrgResponse = Type.Object({
  badges: Type.Array(Type.Object(FullBadge)),
});

export const BadgeOfOrgOptions = {
  schema: {
    params: BadgeOfOrgParams,
    response: {
      200: BadgeOfOrgResponse,
    },
  },
};

export type BadgeOfOrgParams = Static<typeof BadgeOfOrgParams>;
export type BadgePostBody = Static<typeof BadgePostRequest>;
