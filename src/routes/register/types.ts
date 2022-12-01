import { Type, Static } from "@sinclair/typebox";

const RegisterPostRequest = Type.Object({
  email: Type.String({ format: "email" }),
  org: Type.String(),
  captchaToken: Type.String(),
});

const UploadRequest = Type.Object({
  email: Type.String({ format: "email" }),
  org: Type.String(),
  documents: Type.Array(Type.String()),
});

const BaseRegister = {
  email: Type.String({ format: "email" }),
  org: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  documents: Type.Array(Type.String()),
  status: Type.String(),
  evaluation: Type.String(),
  evaluators: Type.Array(Type.String()),
};

const BaseRegisterResponse = Type.Object(BaseRegister);

const RegisterPostResponse = Type.Object({
  ...BaseRegister,

  cloudinary: Type.Object({
    url: Type.String(),
    api_key: Type.String(),
    timestamp: Type.String(),
    signature: Type.String(),
  }),
});

const RegisterGetResponse = Type.Array(BaseRegisterResponse);

const UploadResponse = BaseRegisterResponse;

export const RegisterPostOptions = {
  schema: {
    body: RegisterPostRequest,
    response: {
      201: RegisterPostResponse,
    },
  },
};

export const RegisterGetOptions = {
  schema: {
    response: {
      201: RegisterGetResponse,
    },
  },
};
export const UploadOptions = {
  schema: {
    body: UploadRequest,
    response: {
      201: UploadResponse,
    },
  },
};

export type RegisterBody = Static<typeof RegisterPostRequest>;
export type UploadBody = Static<typeof UploadRequest>;
