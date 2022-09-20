import { FastifyPluginAsync } from "fastify";

const Evaluator: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
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

  fastify.get("/", async function (request, reply) {
    let authUser;
    try {
      const token = request.headers.authorization;
      authUser = await fastify.verifyFbAuth(token!);
    } catch (err) {
      return reply.status(401).send({ message: err });
    }
    const evaluator = await fastify.db.Evaluator.findOne({
      email: authUser.email,
    });
    if (!evaluator) {
      return reply.status(401).send({ message: "Evaluator not found" });
    }

    return reply.status(200).send({ message: "Evaluator" });
  });
};

export default Evaluator;
