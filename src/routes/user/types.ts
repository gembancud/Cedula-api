import { Type } from "@sinclair/typebox";

const UserGetMeResponse = Type.Object({
  name: Type.String(),
  email: Type.String(),
  link: Type.String(),
  contact_number: Type.String(),
});
export const UserGetMeOptions = {
  schema: {
    response: {
      200: UserGetMeResponse,
    },
  },
};
