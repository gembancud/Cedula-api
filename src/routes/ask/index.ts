import { FastifyPluginAsync } from "fastify";
import { AskGetOptions, AskGetQuery, ScopeEnum } from "./types";
import { SITES } from "../../utils/constants";

type linkType = {
  org: string;
  link: string;
};

type badgeType = {
  name: string;
  link: string;
};

const ask: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Querystring: AskGetQuery }>(
    "/",
    AskGetOptions,
    async function (request, reply) {
      const { site, links, orgs, scope } = request.query;
      if (!SITES.includes(site)) return reply.badRequest("Invalid site");

      // Initialize map holding link and verified status
      const tmpLink = new Map<string, linkType[] | null>();
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
          const parsed_orgs: linkType[] = JSON.parse(cache[i]!);
          tmpLink.set(
            links[i],
            scope && scope === ScopeEnum.private
              ? parsed_orgs.filter((org) => orgs.includes(org.org))
              : parsed_orgs
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
            }).lean();
            break;
          case "reddit":
            users = await fastify.db.RedditUser.find({
              link: { $in: dbLinks },
            }).lean();
            break;
          case "fb":
          default:
            users = await fastify.db.FacebookUser.find({
              link: { $in: dbLinks },
            }).lean();
        }
        // Update map with database links
        // Also store in redis cache
        for (const user of users) {
          // get all badges for each org of user
          const registrations = await fastify.db.Registration.find({
            email: user.email,
          });
          const allOrgsOfUser: linkType[] = registrations.map((reg) => {
            const parsedBadges: badgeType[] = reg.badges as badgeType[];
            let activeBadge = parsedBadges.find(
              (badge) => badge.name === reg.active_badge
            );
            // if active badge is not found, set to default
            if (activeBadge === undefined) {
              activeBadge = parsedBadges.find(
                (badge) => badge.name === "default"
              );
            }
            return {
              org: reg.org,
              link: activeBadge!.link,
            };
          });
          fastify.redis.set(
            `site:${site}:link:${user.link}`,
            JSON.stringify(allOrgsOfUser),
            "EX",
            60 * 60 * 1
          );
          tmpLink.set(
            user.link,
            scope && scope === ScopeEnum.private
              ? allOrgsOfUser.filter((org) => orgs.includes(org.org))
              : allOrgsOfUser
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
      console.log("outLink", outLink);

      return reply.status(200).send({ links: outLink });
    }
  );
};

export default ask;
