import { Type, Static } from "@sinclair/typebox";

const RegisterPostRequest = Type.Object({
  name: Type.String(),
  email: Type.String({ format: "email" }),
  org: Type.String(),
  links: Type.Array(Type.Object({ link: Type.String(), site: Type.String() })),
  captchaToken: Type.String(),
});

const UploadRequest = Type.Object({
  email: Type.String({ format: "email" }),
  org: Type.String(),
  documents: Type.Array(Type.String()),
});

const RegisterPostResponse = Type.Object({
  applicant_name: Type.String(),
  applicant_email: Type.String({ format: "email" }),
  applicant_links: Type.String(),
  org: Type.String(),
  fbuid: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  documents: Type.Array(Type.String()),
  status: Type.String(),
  evaluation: Type.String(),
  evaluators: Type.Array(Type.String()),

  cloudinary: Type.Object({
    url: Type.String(),
    api_key: Type.String(),
    timestamp: Type.String(),
    signature: Type.String(),
  }),
});

const RegisterGetResponse = Type.Array(
  Type.Object({
    applicant_name: Type.String(),
    applicant_email: Type.String({ format: "email" }),
    applicant_links: Type.String(),
    org: Type.String(),
    fbuid: Type.String(),
    createdAt: Type.String(),
    updatedAt: Type.String(),
    documents: Type.Array(Type.String()),
    status: Type.String(),
    evaluation: Type.String(),
    evaluators: Type.Array(Type.String()),
  })
);

const UploadResponse = Type.Object({
  applicant_name: Type.String(),
  applicant_email: Type.String({ format: "email" }),
  applicant_links: Type.String(),
  org: Type.String(),
  fbuid: Type.String(),
  createdAt: Type.String(),
  updatedAt: Type.String(),
  documents: Type.Array(Type.String()),
  status: Type.String(),
  evaluation: Type.String(),
  evaluators: Type.String(),
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
