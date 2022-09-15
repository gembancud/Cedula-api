import { Type, Static } from "@sinclair/typebox";

const RegisterRequest = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
});

const LoginRequest = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
});

const VerifyRequest = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
  captchaToken: Type.String(),
  authToken: Type.String(),
});

const UploadRequest = Type.Object({
  email: Type.String({ format: "email" }),
  documents: Type.Array(Type.String()),
});

const AuthResponse = Type.Object({
  token: Type.String(),
  name: Type.String(),
  email: Type.String({ format: "email" }),
});

const VerifyResponse = Type.Object({
  applicant_name: Type.String(),
  applicant_email: Type.String({ format: "email" }),
  fbuid: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  documents: Type.Array(Type.String()),
  status: Type.String(),
  evaluation: Type.String(),
  evaluator: Type.String(),

  cloudinary: Type.Object({
    url: Type.String(),
    api_key: Type.String(),
    timestamp: Type.String(),
    signature: Type.String(),
  }),
});

const UploadResponse = Type.Object({
  applicant_name: Type.String(),
  applicant_email: Type.String({ format: "email" }),
  fbuid: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  documents: Type.Array(Type.String()),
  status: Type.String(),
  evaluation: Type.String(),
  evaluator: Type.String(),
});
export const RegisterOptions = {
  schema: {
    body: RegisterRequest,
    response: {
      201: AuthResponse,
    },
  },
};

export const LoginOptions = {
  schema: {
    body: LoginRequest,
    response: {
      200: AuthResponse,
    },
  },
};

export const VerifyOptions = {
  schema: {
    body: VerifyRequest,
    response: {
      201: VerifyResponse,
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

export type RegisterBody = Static<typeof RegisterRequest>;
export type LoginBody = Static<typeof LoginRequest>;
export type VerifyBody = Static<typeof VerifyRequest>;
export type UploadBody = Static<typeof UploadRequest>;
