import { FastifyPluginAsync } from "fastify";
import {
  BadgeOfOrgOptions,
  BadgeOfOrgParams,
  BadgePostBody,
  BadgePostOptions,
} from "./types";

const badge: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post<{ Body: BadgePostBody }>(
    "/",
    BadgePostOptions,
    async function (request, reply) {
      try {
        const { name, org, link, description, password } = request.body;

        if (password !== process.env.ADMIN_PASSWORD)
          return reply.forbidden("Invalid password");
        const docBadge = new fastify.db.Badge({
          name,
          org,
          link,
          description,
        });
        await docBadge.save();
        reply.code(200).send(docBadge);
      } catch (err) {
        return reply.status(401).send({ message: err });
      }
    }
  );

  fastify.get<{ Params: BadgeOfOrgParams }>(
    "/:org",
    BadgeOfOrgOptions,
    async function (request, reply) {
      try {
        const { org } = request.params;
        const badges = await fastify.db.Badge.find({ org });
        reply.code(200).send({ badges });
      } catch (err) {
        return reply.status(401).send({ message: err });
      }
    }
  );
};

export default badge;
