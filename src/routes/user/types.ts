import { Static, Type } from "@sinclair/typebox";
import { org } from "../org/types";

const MeOrg = {
  ...org,
  active_badge: Type.String(),
  status: Type.String(),
  documents: Type.Array(Type.String()),
  badges: Type.Array(
    Type.Object({
      name: Type.String(),
      link: Type.String(),
    })
  ),
};

const BaseLink = {
  link: Type.String(),
  site: Type.String(),
};

const BaseUser = {
  name: Type.String(),
  email: Type.String({ format: "email" }),
  contact_number: Type.String(),
  links: Type.Array(Type.Object(BaseLink)),
};

const UserGetMeResponse = Type.Object({
  ...BaseUser,
  orgs: Type.Array(Type.Object(MeOrg)),
});

const UserPostRequest = Type.Object({
  ...BaseUser,
  captchaToken: Type.String(),
});

const UserPostResponse = Type.Object({
  ...BaseUser,
});

export const UserGetMeOptions = {
  schema: {
    response: {
      200: UserGetMeResponse,
    },
  },
};

export const UserPostOptions = {
  schema: {
    body: UserPostRequest,
    response: {
      201: UserPostResponse,
    },
  },
};

export type UserPostBody = Static<typeof UserPostRequest>;
