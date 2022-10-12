import { FastifyPluginAsync } from "fastify";
import { AskGetOptions, AskGetQuery } from "./types";
import { SITES } from "../../utils/constants";

const ask: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Querystring: AskGetQuery }>(
    "/",
    AskGetOptions,
    async function (request, reply) {
      const { site, links, orgs } = request.query;
      if (!SITES.includes(site)) return reply.badRequest("Invalid site");

      // Initialize map holding link and verified status
      const tmpLink = new Map<string, string[] | null>();
      for (const link of links) {
        tmpLink.set(link, null);
      }

      // Check redis cache for link
      const siteLinks: string[] = links.map(
        (link) => `site:${site}:link:${link}`
      );
      const cache = await fastify.redis.mget(siteLinks);

      // Update map with cached links
      for (let i = 0; i < cache.length; i++) {
        if (cache[i] !== null) {
          // const parsed: string[] = JSON.parse(cache[i]!);
          console.log(
            "intersection",
            orgs.filter((org) => cache[i]!.includes(org))
          );
          tmpLink.set(
            links[i],
            orgs.filter((org) => cache[i]!.includes(org))
          );
        }
      }

      // Filter out links that are already verified
      const dbLinks = Array.from(tmpLink.keys()).filter(
        (link) => tmpLink.get(link) === null
      );
      // Skip database query if all links taken from cache
      if (dbLinks.length > 0) {
        // Check database for link
        let users;
        switch (site) {
          case "twitter":
            users = await fastify.db.TwitterUser.find({
              link: { $in: dbLinks },
            });
            break;
          case "fb":
          default:
            users = await fastify.db.FacebookUser.find({
              link: { $in: dbLinks },
            });
        }
        // Update map with database links
        // Also store in redis cache
        for (const user of users) {
          fastify.redis.set(
            `site:${site}:link:${user.link}`,
            JSON.stringify(user.orgs),
            "EX",
            60 * 60 * 24
          );
          tmpLink.set(
            user.link,
            orgs.filter((org) => user.orgs.includes(org))
          );
        }
      }

      // Users that are not verified get cached as false
      for (const [link, org] of tmpLink) {
        if (org === null) {
          fastify.redis.set(
            `site:${site}:link:${link}`,
            "[]",
            "EX",
            60 * 60 * 24
          );
        }
      }

      // Transform map to fit response schema
      const outLink = Array.from(tmpLink.entries()).map(([link, tmpOrgs]) => ({
        link,
        orgs: tmpOrgs ?? [],
      }));

      return reply.status(200).send({ links: outLink });
    }
  );
};

export default ask;
