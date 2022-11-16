import { Type } from "@sinclair/typebox";

const UserGetMeResponse = Type.Object({
  name: Type.String(),
  email: Type.String(),
  links: Type.String(),
  contact_number: Type.String(),
  orgs: Type.Array(Type.String()),
});
export const UserGetMeOptions = {
  schema: {
    response: {
      200: UserGetMeResponse,
    },
  },
};
