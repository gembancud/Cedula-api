import { Type, Static } from "@sinclair/typebox";

const TagGetResponse = Type.Object({
  tags: Type.Array(
    Type.Object({
      label: Type.String(),
      tag: Type.String(),
    })
  ),
});

export const TagGetOptions = {
  schema: {
    response: {
      200: TagGetResponse,
    },
  },
};

const TagGetOneParams = Type.Object({
  id: Type.String(),
});

export const TagGetOneOptions = {
  schema: {
    params: TagGetOneParams,
    response: {
      200: TagGetResponse,
    },
  },
};

export type TagGetOneParams = Static<typeof TagGetOneParams>;
