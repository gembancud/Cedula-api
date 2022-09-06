import { Type, Static } from "@sinclair/typebox";

const RegisterRequest = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
});

const LoginRequest = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
});

const AuthResponse = Type.Object({
  token: Type.String(),
  name: Type.String(),
  email: Type.String({ format: "email" }),
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

export type RegisterBody = Static<typeof RegisterRequest>;
export type LoginBody = Static<typeof LoginRequest>;
