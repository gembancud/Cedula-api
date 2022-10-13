import { FastifyPluginAsync } from "fastify";
import {
  EvaluatorDeleteBody,
  EvaluatorDeleteOptions,
  EvaluatorPostBody,
  EvaluatorPostOptions as EvaluatorPostOptions,
  TagPostBody,
  TagPostOptions,
} from "./types";

const admin: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    return "this is admin";
  });

  fastify.post<{ Body: EvaluatorPostBody }>(
    "/evaluator",
    EvaluatorPostOptions,
    async function (request, reply) {
      const { email, password, org, credential } = request.body;
      if (password !== process.env.ADMIN_PASSWORD)
        return reply.forbidden("Invalid password");

      const user = await fastify.db.Evaluator.findOne({ email, org });
      if (user) {
        console.log("user", user);
        return reply.conflict("User already exists");
      }

      const evaluator = new fastify.db.Evaluator({
        email,
        credential,
        org,
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

  fastify.post<{ Body: TagPostBody }>(
    "/tag",
    TagPostOptions,
    async function (request, reply) {
      try {
        const { label, site, tag, password } = request.body;
        if (password !== process.env.ADMIN_PASSWORD)
          return reply.forbidden("Invalid password");

        const doctag = new fastify.db.Tag({
          label,
          site,
          tag,
        });
        console.log("doctag", doctag);

        doctag.save((err, doctag) => {
          if (err || !doctag) {
            return reply.internalServerError("Error saving tag to db");
          }
        });

        // Invalidate cache and replace with new tags
        await fastify.redis.del(`site:${site}:tags`);
        const outTags: object[] = [];
        const docTags = await fastify.db.Tag.find();
        for (const docTag of docTags) {
          const { label, tag } = docTag;
          outTags.push({ label, tag });
        }
        fastify.redis.set(
          `site:${site}:tags`,
          JSON.stringify(outTags),
          "EX",
          60 * 60 * 24
        );

        return reply.status(201).send("Tag created");
      } catch (err) {
        console.log(err);
        return reply.internalServerError("Error saving tag");
      }
    }
  );
};
export default admin;
