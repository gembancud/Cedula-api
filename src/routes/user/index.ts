import { FastifyPluginAsync } from "fastify";
import { UserGetMeOptions } from "./types";

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
      if (docProfile) {
        return reply.status(200).send({
          ...docProfile.toObject(),
        });
      } else {
        return reply.status(404).send({ error: "Profile not found" });
      }
    } catch (err) {
      return reply.status(401).send({ message: err });
    }
  });
};

export default user;
