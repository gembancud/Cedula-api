import { FastifyPluginAsync } from "fastify";
import {
  EvaluatorDeleteBody,
  EvaluatorDeleteOptions,
  EvaluatorPostBody,
  EvaluatorPostOptions as EvaluatorPostOptions,
} from "./types";

const admin: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    return "this is admin";
  });

  fastify.post<{ Body: EvaluatorPostBody }>(
    "/evaluator",
    EvaluatorPostOptions,
    async function (request, reply) {
      const { email, password, credential } = request.body;
      if (password !== process.env.ADMIN_PASSWORD)
        return reply.forbidden("Invalid password");

      const user = await fastify.db.Evaluator.findOne({ email });
      if (user) return reply.conflict("User already exists");

      const evaluator = new fastify.db.Evaluator({
        email,
        credential,
      });
      evaluator.save((err, evaluator) => {
        if (err || !evaluator) {
          return reply.internalServerError("Error saving evaluator");
        }
      });
      return reply.status(201).send("Evaluator created");
    }
  );

  fastify.delete<{ Body: EvaluatorDeleteBody }>(
    "/evaluator",
    EvaluatorDeleteOptions,
    async function (request, reply) {
      const { email, password } = request.body;
      if (password !== process.env.ADMIN_PASSWORD)
        fastify.httpErrors.forbidden();
      const evaluator = await fastify.db.Evaluator.findOne({ email });
      if (!evaluator) {
        return reply.status(404).send({ message: "Evaluator not found" });
      }
      evaluator.remove((err, evaluator) => {
        if (err || !evaluator) {
          fastify.httpErrors.createError();
        } else {
          return reply.status(200).send({ message: "Evaluator deleted" });
        }
      });
      return reply.status(200).send({ message: "Evaluator deleted" });
    }
  );
};
export default admin;
