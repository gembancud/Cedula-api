import { FastifyPluginAsync } from "fastify";
import {
  RegisterBody,
  RegisterGetOptions,
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
      const { name, email, links, org, captchaToken } = request.body;
      let authUser;
      try {
        const token = request.headers.authorization;
        authUser = await fastify.verifyFbAuth(token!);
      } catch (err) {
        console.log(err);
        return reply.status(401).send({ message: err });
      }

      const captcha = await hcaptchaVerify(captchaToken);
      if (!captcha)
        return reply.status(401).send({ message: "Captcha Unauthorized" });

      const existing = await fastify.db.Registration.findOne({
        applicant_email: email,
      });
      if (existing) {
        return reply.status(409).send({ message: "Registration exists" });
      }
      const dbEvaluators = await fastify.db.Evaluator.aggregate([
        { $sample: { size: 1 } },
      ]);
      const evaluators: string[] = [];
      for (const evaluator of dbEvaluators) {
        evaluators.push(evaluator.email);
      }

      const registration = new fastify.db.Registration({
        applicant_name: name,
        applicant_email: email,
        applicant_links: JSON.stringify(links),
        org,
        fbuid: authUser.uid,
        evaluators: evaluators,
      });

      registration.save((err, user) => {
        if (err || !user) {
          return reply.internalServerError("Creating Registration Failed");
        }
      });

      // PROTOTYPE STEP: Automatically adds facebookuser upon registration
      // this bypasses registration step temporarily.
      // TODO: Remove this step when registration and verification is complete
      const splicedLink = links[0].link.split("/").slice(-1)[0];
      const fbLink = `site:fb:link:${splicedLink}`;
      const facebookUser = new fastify.db.FacebookUser({
        name,
        email,
        orgs: [org],
        link: splicedLink,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
      });
      facebookUser.save((err, user) => {
        if (err || !user) {
          console.log(err);
        }
      });
      fastify.redis.set(fbLink, `[${org}]`, "EX", 60 * 60 * 24);

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

      const newRegistration = await fastify.db.Registration.findOne({ email });

      return reply.status(201).send({ ...newRegistration!.toObject() });
    }
  );
};

export default register;
