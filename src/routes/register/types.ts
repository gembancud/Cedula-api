import { Type, Static } from "@sinclair/typebox";

const RegisterPostRequest = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
  link: Type.String(),
  captchaToken: Type.String(),
});

const UploadRequest = Type.Object({
  email: Type.String({ format: "email" }),
  documents: Type.Array(Type.String()),
});

const RegisterPostResponse = Type.Object({
  applicant_name: Type.String(),
  applicant_email: Type.String({ format: "email" }),
  applicant_link: Type.String(),
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

const RegisterGetResponse = Type.Object({
  applicant_name: Type.String(),
  applicant_email: Type.String({ format: "email" }),
  applicant_link: Type.String(),
  fbuid: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  documents: Type.Array(Type.String()),
  status: Type.String(),
  evaluation: Type.String(),
  evaluator: Type.String(),
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
