import { Static, Type } from "@sinclair/typebox";

const UserGetMeResponse = Type.Object({
  name: Type.String(),
  email: Type.String(),
  links: Type.Array(
    Type.Object({
      link: Type.String(),
      site: Type.String(),
    })
  ),
  contact_number: Type.String(),
  orgs: Type.Array(
    Type.Object({
      org: Type.String(),
      active_badge: Type.String(),
      badges: Type.Array(
        Type.Object({
          name: Type.String(),
          link: Type.String(),
        })
      ),
    })
  ),
});

const BaseUser = {
  name: Type.String(),
  email: Type.String({ format: "email" }),
  contact_number: Type.String(),
  links: Type.Array(Type.Object({ link: Type.String(), site: Type.String() })),
};

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
