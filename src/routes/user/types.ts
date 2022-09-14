import { Type, Static } from "@sinclair/typebox";
import multer from "fastify-multer";
// const upload = multer({ dest: "uploads/" });

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

const AuthResponse = Type.Object({
  token: Type.String(),
  name: Type.String(),
  email: Type.String({ format: "email" }),
});

const VerifyResponse = Type.Object({
  token: Type.String(),
  uid: Type.String(),
  name: Type.String(),
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
  // preHandler: upload.single("file"),
  preValidation: multer({
    limits: {
      fileSize: 1024 * 1024 * 5,
    },
    storage: multer.memoryStorage(),
  }).single("media"),
};

export type RegisterBody = Static<typeof RegisterRequest>;
export type LoginBody = Static<typeof LoginRequest>;
export type VerifyBody = Static<typeof VerifyRequest>;
