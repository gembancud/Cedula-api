import { Type } from "@sinclair/typebox";

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
