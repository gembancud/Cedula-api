import { Type } from "@sinclair/typebox";

const BadgeGetMeResponse = Type.Object({
  badges: Type.Array(
    Type.Object({
      name: Type.String(),
      org: Type.String(),
      link: Type.String(),
    })
  ),
});
export const BadgeGetMeOptions = {
  schema: {
    response: {
      200: BadgeGetMeResponse,
    },
  },
};
