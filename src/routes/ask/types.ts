import { Type, Static } from "@sinclair/typebox";

const AskGetQuery = Type.Object({
  links: Type.Array(Type.String()),
});

const AskGetResponse = Type.Object({
  links: Type.Array(
    Type.Object({
      link: Type.String(),
      verified: Type.Boolean(),
    })
  ),
});

export const AskGetOptions = {
  schema: {
    // params: AskGetParams,
    querystring: AskGetQuery,
    response: {
      200: AskGetResponse,
    },
  },
};

export type AskGetQuery = Static<typeof AskGetQuery>;
