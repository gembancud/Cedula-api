import { Type, Static } from "@sinclair/typebox";

export enum ScopeEnum {
  "all" = "all",
  "private" = "private",
}

const AskGetQuery = Type.Object({
  site: Type.String(),
  orgs: Type.Array(Type.String()),
  links: Type.Array(Type.String()),
  scope: Type.Optional(Type.Enum(ScopeEnum)),
});

const AskGetResponse = Type.Object({
  links: Type.Array(
    Type.Object({
      link: Type.String(),
      orgs: Type.Array(
        Type.Object({
          org: Type.String(),
          link: Type.String(),
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
