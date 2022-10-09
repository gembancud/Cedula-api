import { FastifyPluginAsync } from "fastify";
import { EvaluatorGetOptions, EvaluatorGetQuery } from "./types";

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

  fastify.get<{ Querystring: EvaluatorGetQuery }>(
    "/",
    EvaluatorGetOptions,
    async function (request, reply) {
      const { org } = request.query;
      try {
        const token = request.headers.authorization;
        const authUser = await fastify.verifyFbAuth(token!);
        const evaluator = await fastify.db.Evaluator.findOne({
          email: authUser.email,
          org,
        });
        if (!evaluator) {
          return reply.status(401).send({ message: "Evaluator not found" });
        }

        return reply.status(200).send({ message: "Evaluator" });
      } catch (err) {
        return reply.status(401).send({ message: err });
      }
    }
  );
};

export default Evaluator;
