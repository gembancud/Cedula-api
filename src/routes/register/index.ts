import { FastifyPluginAsync } from "fastify";
import {
  RegisterBody,
  RegisterGetOptions,
  RegisterPatchBody,
  RegisterPatchOptions,
  RegisterPatchParams,
  RegisterPostOptions,
  UploadBody,
  UploadOptions,
} from "./types";
import { hcaptchaVerify } from "../../utils/hcaptcha";
import { genCloudinaryRequest } from "../../utils/cloudinary";

const register: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      const token = request.headers.authorization;
      if (!token) {
        throw new Error("No token");
      }
      const authToken = fastify.verifyFbAuth(token);
      if (!authToken)
        throw new Error("Next Firebase Auth: Cookie not authorized");
    } catch (err) {
      reply.unauthorized();
    }
  });

  fastify.post<{ Body: RegisterBody }>(
    "/",
    RegisterPostOptions,
    async function (request, reply) {
      const { email, org, captchaToken } = request.body;
      let authUser;
      try {
        const token = request.headers.authorization;
        authUser = await fastify.verifyFbAuth(token!);
      } catch (err) {
        console.log(err);
        return reply.status(401).send({ message: err });
      }

      if (authUser.email !== email) {
        return reply
          .status(401)
          .send({ message: "Cannot POST with different email" });
      }

      const captcha = await hcaptchaVerify(captchaToken);
      if (!captcha)
        return reply.status(401).send({ message: "Captcha Unauthorized" });

      const existingprofile = await fastify.db.Profile.findOne({ email });
      if (!existingprofile) {
        return reply.status(409).send({ message: "Profile does not exist" });
      }

      const existingregistration = await fastify.db.Registration.findOne({
        email,
        org,
      });
      if (existingregistration) {
        return reply.status(409).send({ message: "Registration exists" });
      }

      const dbEvaluators = await fastify.db.Evaluator.aggregate([
        { $sample: { size: 1 } },
      ]);
      const evaluators: string[] = [];
      for (const evaluator of dbEvaluators) {
        evaluators.push(evaluator.email);
      }

      const defaultBadge = await fastify.db.Badge.findOne({
        name: "default",
        org,
      }).lean();
      if (!defaultBadge) {
        return reply.status(409).send({
          message: "Default badge does not exist. Please contact support",
        });
      }

      const registration = new fastify.db.Registration({
        email,
        org,
        evaluators: evaluators,
        badges: [
          {
            name: "default",
            link: defaultBadge!.link,
          },
        ],
        active_badge: "default",
      });

      registration.save((err, user) => {
        if (err || !user) {
          return reply.internalServerError("Creating Registration Failed");
        }
      });

      const cloudinary = await genCloudinaryRequest(org);
      return reply.status(201).send({
        ...registration.toObject(),
        cloudinary,
      });
    }
  );

  fastify.get("/", RegisterGetOptions, async function (request, reply) {
    try {
      const token = request.headers.authorization;
      const { uid } = await fastify.verifyFbAuth(token!);

      const existing = await fastify.db.Registration.find({ fbuid: uid });
      if (!existing)
        return reply
          .status(409)
          .send({ message: "Registration does not exist" });

      const registrations = existing.map((reg) => {
        return { ...reg.toObject() };
      });
      return reply.status(200).send(registrations);
    } catch (err) {
      console.log(err);
      return reply.status(401).send({ message: err });
    }
  });

  fastify.post<{ Body: UploadBody }>(
    "/upload",
    UploadOptions,
    async function (request, reply) {
      const { email, org, documents } = request.body;
      const registration = await fastify.db.Registration.findOneAndUpdate(
        { email, org },
        { $push: { documents } }
      );
      if (!registration) return reply.badRequest("Upload failed");

      const newRegistration = await fastify.db.Registration.findOne({
        email,
        org,
      });

      const profile = await fastify.db.Profile.findOne({ email });

      return reply.status(201).send({
        ...profile?.toObject(),
        ...newRegistration!.toObject(),
      });
    }
  );

  fastify.patch<{ Params: RegisterPatchParams; Body: RegisterPatchBody }>(
    "/:org",
    RegisterPatchOptions,
    async function (request, reply) {
      try {
        const org = request.params.org;
        const { active_badge, badges } = request.body;

        const token = request.headers.authorization;
        const authUser = await fastify.verifyFbAuth(token!);
        const profile = await fastify.db.Profile.findOne({
          email: authUser.email,
        }).lean();
        if (!profile) {
          return reply.status(404).send({ error: "Profile not found" });
        }
        await fastify.db.Registration.findOneAndUpdate(
          {
            email: authUser.email,
            org,
          },
          {
            $set: {
              active_badge,
              badges,
            },
          }
        );
        await fastify.ClearUserCache({ email: authUser.email });
      } catch (err) {
        return reply.status(401).send({ error: err });
      }
    }
  );
};

export default register;
