import { FastifyPluginAsync } from "fastify";
import {
  RegisterOptions,
  RegisterBody,
  LoginOptions,
  LoginBody,
  VerifyBody,
  VerifyOptions,
  UploadBody,
  UploadOptions,
} from "./types";
// import { uploadPicture } from "../../utils/cloudinary";
import { hcaptchaVerify } from "../../utils/hcaptcha";
import { genCloudinaryRequest } from "../../utils/cloudinary";

const user: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async (request, reply) => {
    return { hello: "world" };
  });
  fastify.post<{ Body: RegisterBody }>(
    "/register",
    RegisterOptions,
    async function (request, reply) {
      const { email } = request.body;

      const user = new fastify.db.User({
        ...request.body,
      });

      user.save((err, user) => {
        if (err || !user) {
          fastify.httpErrors.createError();
        }
      });

      const token = fastify.generateJwt(email, "");
      return reply.status(201).send({ ...user.toObject(), token });
    }
  );
  fastify.post<{ Body: LoginBody }>(
    "/login",
    LoginOptions,
    async function (request, reply) {
      const { email } = request.body;
      const user = await fastify.db.User.findOne({ email });

      if (!user) {
        return reply.status(404).send({ message: "User not found" });
      }
      const token = fastify.generateJwt(email, "");
      return reply.status(200).send({ ...user.toObject(), token });
    }
  );

  fastify.post<{ Body: VerifyBody }>(
    "/verify",
    VerifyOptions,
    async function (request, reply) {
      const { name, email, authToken, captchaToken } = request.body;
      const uid = await fastify.verifyFbAuth(authToken);
      if (!uid)
        return reply
          .status(401)
          .send({ message: "Firebase user Unauthorized" });

      const captcha = await hcaptchaVerify(captchaToken);
      if (!captcha)
        return reply.status(401).send({ message: "Captcha Unauthorized" });

      const evaluator = await fastify.db.Evaluator.aggregate([
        { $sample: { size: 1 } },
      ]);

      const existing = await fastify.db.Registration.findOne({ email });
      if (existing)
        return reply.status(409).send({ message: "Registration exists" });
      const registration = new fastify.db.Registration({
        applicant_name: name,
        applicant_email: email,
        fbuid: uid,
        evaluator: evaluator[0].email,
      });

      registration.save((err, user) => {
        if (err || !user) {
          return reply.internalServerError("Creating Registration Failed");
        }
      });

      const cloudinary = await genCloudinaryRequest();
      return reply.status(201).send({
        ...registration.toObject(),
        cloudinary,
      });
    }
  );

  fastify.post<{ Body: UploadBody }>(
    "/upload",
    UploadOptions,
    async function (request, reply) {
      const { email, documents } = request.body;
      const registration = await fastify.db.Registration.findOneAndUpdate(
        { email },
        { $push: { documents } }
      );
      if (!registration) return reply.badRequest("Upload failed");

      const newRegistration = await fastify.db.Registration.findOne({ email });

      console.log("documents", documents);
      return reply.status(201).send({ ...newRegistration!.toObject() });
    }
  );
};

export default user;
