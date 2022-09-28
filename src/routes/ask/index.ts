import { FastifyPluginAsync } from "fastify";
import { AskGetOptions, AskGetQuery } from "./types";
// import { AskGetBody } from "./types";

const ask: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Querystring: AskGetQuery }>(
    "/",
    AskGetOptions,
    async function (request, reply) {
      const { links } = request.query;

      // Initialize map holding link and verified status
      const tmpLink = new Map<string, boolean | null>();
      for (const link of links) {
        tmpLink.set(link, null);
      }

      // Check redis cache for link
      const cache = await fastify.redis.mget(links);

      // Update map with cached links
      for (let i = 0; i < cache.length; i++) {
        if (cache[i]) tmpLink.set(links[i], cache[i] === "1" ? true : false);
      }

      // Filter out links that are already verified
      const dbLinks = Array.from(tmpLink.keys()).filter(
        (link) => tmpLink.get(link) === null
      );
      // Skip database query if all links taken from cache
      if (dbLinks.length > 0) {
        // Check database for link
        const users = await fastify.db.FacebookUser.find({
          link: { $in: dbLinks },
        });

        // Update map with database links
        // Also store in redis cache
        for (const user of users) {
          fastify.redis.set(user.link, "1", "EX", 60 * 60 * 24);
          tmpLink.set(user.link, true);
        }
      }

      // Users that are not verified get cached as false
      for (const [link, verified] of tmpLink) {
        if (verified === null) {
          fastify.redis.set(link, "0", "EX", 60 * 60 * 24);
        }
      }

      // Transform map to fit response schema
      const outLink = Array.from(tmpLink.entries()).map(([link, verified]) => ({
        link,
        verified,
      }));

      return reply.status(200).send({ links: outLink });
    }
  );
};

export default ask;
