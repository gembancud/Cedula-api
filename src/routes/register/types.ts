import { Type, Static } from "@sinclair/typebox";

const RegisterPostRequest = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
  contact_number: Type.String(),
  org: Type.String(),
  links: Type.Array(Type.Object({ link: Type.String(), site: Type.String() })),
  captchaToken: Type.String(),
});

const UploadRequest = Type.Object({
  email: Type.String({ format: "email" }),
  org: Type.String(),
  documents: Type.Array(Type.String()),
});

const BaseRegister = {
  name: Type.String(),
  email: Type.String({ format: "email" }),
  links: Type.String(),
  contact_number: Type.String(),
  org: Type.String(),
  fbuid: Type.String(),
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
