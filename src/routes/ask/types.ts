import { Type, Static } from "@sinclair/typebox";

const AskGetQuery = Type.Object({
  site: Type.String(),
  orgs: Type.Array(Type.String()),
  links: Type.Array(Type.String()),
});

const AskGetResponse = Type.Object({
  links: Type.Array(
    Type.Object({
      link: Type.String(),
      orgs: Type.Array(
        Type.Object({
          org: Type.String(),
          badge_link: Type.String(),
        })
      ),
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
