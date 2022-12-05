import { FastifyPluginAsync } from "fastify";
import { hcaptchaVerify } from "../../utils/hcaptcha";
import { UserGetMeOptions, UserPostBody, UserPostOptions } from "./types";

const user: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      const token = request.headers.authorization;
      if (!token) {
        throw new Error("No token");
      }
      const decodedAuthToken = fastify.verifyFbAuth(token);
      if (!decodedAuthToken)
        throw new Error("Next Firebase Auth: Cookie not authorized");
    } catch (err) {
      reply.unauthorized();
    }
  });

  fastify.get("/me", UserGetMeOptions, async function (request, reply) {
    try {
      const token = request.headers.authorization;
      const authUser = await fastify.verifyFbAuth(token!);
      const docProfile = await fastify.db.Profile.findOne({
        email: authUser.email,
      });
      if (!docProfile) {
        return reply.status(404).send({ error: "Profile not found" });
      }
      const docListRegistrations = await fastify.db.Registration.find({
        email: authUser.email,
      });
      const orgs = docListRegistrations.map((doc) => {
        return {
          org: doc.org,
          active_badge: doc.active_badge,
          badges: doc.badges,
        };
      });

      return reply.status(200).send({
        ...docProfile.toObject(),
        orgs,
      });
    } catch (err) {
      return reply.status(401).send({ message: err });
    }
  });

  fastify.post<{ Body: UserPostBody }>(
    "/",
    UserPostOptions,
    async function (request, reply) {
      const { name, email, contact_number, links, captchaToken } = request.body;
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

      const docProfile = await fastify.db.Profile.findOne({
        fbuid: authUser.uid,
      });
      if (docProfile) {
        return reply.status(409).send({ message: "Profile already exists" });
      }

      const profile = new fastify.db.Profile({
        name,
        email,
        links,
        contact_number,
        fbuid: authUser.uid,
      });

      profile.save((err, profile) => {
        if (err || !profile) {
          return reply.internalServerError("Create profile failed");
        }
      });

      return reply.status(201).send({
        ...profile.toObject(),
      });
    }
  );

  fastify.patch<{ Body: UserPostBody }>(
    "/",
    UserPostOptions,
    async function (request, reply) {
      const { name, email, contact_number, links, captchaToken } = request.body;
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
          .send({ message: "Error cannot modify different account" });
      }

      const captcha = await hcaptchaVerify(captchaToken);
      if (!captcha)
        return reply.status(401).send({ message: "Captcha Unauthorized" });

      const profile = await fastify.db.Profile.findOneAndUpdate(
        { fbuid: authUser.uid },
        { $set: { name, email, links, contact_number } }
      );
      if (!profile) {
        return reply.status(404).send({ message: "Profile not found" });
      }
      fastify.SetUserLinks({ email, links });

      return reply.status(201).send({
        ...profile.toObject(),
      });
    }
  );
};

export default user;
