import { FastifyPluginAsync } from "fastify";
import { VerifyGetOptions } from "./types";

const verify: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
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

  fastify.get("/", VerifyGetOptions, async function (request, reply) {
    let authUser;
    try {
      const token = request.headers.authorization;
      authUser = await fastify.verifyFbAuth(token!);
    } catch (err) {
      return reply.status(401).send({ message: err });
    }

    const docList = await fastify.db.Registration.find({
      evaluator: authUser.email,
    });
    const objList = docList.map((item) => {
      return { ...item.toObject(), id: item.applicant_email };
    });
    return reply
      .header("X-Total-Count", objList.length)
      .status(200)
      .send(objList);
  });
};

export default verify;
