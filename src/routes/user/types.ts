import { Type } from "@sinclair/typebox";

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

export const UserGetMeOptions = {
  schema: {
    response: {
      200: UserGetMeResponse,
    },
  },
};
