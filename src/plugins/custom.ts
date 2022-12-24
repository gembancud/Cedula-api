import { SupportPluginOptions } from "./support";
import fp from "fastify-plugin";

import { auth } from "../utils/initFirebase";
import { DecodedIdToken } from "firebase-admin/auth";

export default fp<SupportPluginOptions>(async (fastify, opts) => {
  fastify.decorate("verifyFbAuth", async (token: string) => {
    const decodedToken: DecodedIdToken = await auth
      .verifyIdToken(token)
      .catch((error) => {
        console.error(error);
        return error;
      });
    if (decodedToken != null) {
      // console.log("VerifyfbAuth: ", decodedToken);
      return decodedToken;
    }
  });

  fastify.decorate(
    "SetUserLinks",
    async ({ email, upsert }: SetUserLinksInterface) => {
      const profile = await fastify.db.Profile.findOne({
        email: email,
      }).lean();
      if (!profile) {
        throw new Error("Profile not found");
      }
      const acceptedOrgs = await fastify.db.Registration.find({
        email: email,
        status: "accepted",
      }).lean();
      const orgs = acceptedOrgs.map((org) => org.org);
      console.log("serUserLinks orgs", orgs);

      for (const link of profile.links) {
        if (link.link === "") {
          switch (link.site) {
            case "fb":
              fastify.db.FacebookUser.findOne({
                email: profile.email,
              })
                .remove()
                .exec();
              break;
            case "twitter":
              fastify.db.TwitterUser.findOne({
                email: profile.email,
              })
                .remove()
                .exec();
              break;
            case "reddit":
              fastify.db.RedditUser.findOne({
                email: profile.email,
              })
                .remove()
                .exec();
              break;
          }
        }
        switch (link.site) {
          case "fb":
            const splicedFbLink = link.link.split("/").slice(-1)[0];
            const fbUser = await fastify.db.FacebookUser.findOne({
              email: profile.email,
            });
            if (fbUser) {
              await fastify.db.FacebookUser.updateOne(
                { email: profile.email },
                {
                  $set: {
                    orgs,
                    name: profile.name,
                    link: splicedFbLink,
                  },
                }
              );
            } else if (upsert) {
              const facebookUser = new fastify.db.FacebookUser({
                name: profile.name,
                email: profile.email,
                orgs,
                link: splicedFbLink,
                createdAt: Date.now(),
                expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
              });
              facebookUser.save((err, user) => {
                if (err || !user) {
                  console.log(err);
                }
              });
              const fbLink = `site:fb:link:${splicedFbLink}`;
              fastify.redis.set(
                fbLink,
                JSON.stringify(orgs),
                "EX",
                60 * 60 * 24
              );
            }

            break;

          case "twitter":
            const splicedTwitterLink = link.link.split("/").slice(-1)[0];
            const twitterUser = await fastify.db.TwitterUser.findOne({
              email: profile.email,
            });
            if (twitterUser) {
              await fastify.db.TwitterUser.updateOne(
                { email: profile.email },
                {
                  $set: {
                    orgs,
                    name: profile.name,
                    link: splicedTwitterLink,
                  },
                }
              );
            } else if (upsert) {
              const twitterUser = new fastify.db.TwitterUser({
                name: profile.name,
                email: profile.email,
                orgs,
                link: splicedTwitterLink,
                createdAt: Date.now(),
                expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
              });
              twitterUser.save((err, user) => {
                if (err || !user) {
                  console.log(err);
                }
              });
              const twitterLink = `site:twitter:link:${splicedTwitterLink}`;
              fastify.redis.set(
                twitterLink,
                JSON.stringify(orgs),
                "EX",
                60 * 60 * 24
              );
            }
            break;

          case "reddit":
            const splicedRedditLink = link.link.split("/").slice(-1)[0];
            const redditUser = await fastify.db.RedditUser.findOne({
              email: profile.email,
            });
            if (redditUser) {
              await fastify.db.RedditUser.updateOne(
                { email: profile.email },
                {
                  $set: {
                    orgs,
                    link: splicedRedditLink,
                    name: profile.name,
                  },
                }
              );
            } else if (upsert) {
              const redditUser = new fastify.db.RedditUser({
                name: profile.name,
                email: profile.email,
                orgs,
                link: splicedRedditLink,
                createdAt: Date.now(),
                expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
              });
              redditUser.save((err, user) => {
                if (err || !user) {
                  console.log(err);
                }
              });
              const redditLink = `site:reddit:link:${splicedRedditLink}`;
              fastify.redis.set(
                redditLink,
                JSON.stringify(orgs),
                "EX",
                60 * 60 * 24
              );
            }
            break;
        }
      }
    }
  );

  fastify.decorate(
    "ClearUserCache",
    async ({ email }: ClearUserCacheInterface) => {
      const fbUser = await fastify.db.FacebookUser.findOne({
        email,
      }).lean();
      if (fbUser) {
        fastify.redis.del(`site:fb:link:${fbUser.link}`);
      }
      const twitterUser = await fastify.db.TwitterUser.findOne({
        email,
      }).lean();
      if (twitterUser) {
        fastify.redis.del(`site:twitter:link:${twitterUser.link}`);
      }
      const redditUser = await fastify.db.RedditUser.findOne({
        email,
      }).lean();
      if (redditUser) {
        fastify.redis.del(`site:reddit:link:${redditUser.link}`);
      }
    }
  );
});

interface SetUserLinksInterface {
  email: string;
  upsert?: boolean; // if true, creates users if they don't exist
}

interface ClearUserCacheInterface {
  email: string;
}

declare module "fastify" {
  export interface FastifyInstance {
    verifyFbAuth: (token: string) => any;
    SetUserLinks: ({}: SetUserLinksInterface) => Promise<void>;
    ClearUserCache: ({}: ClearUserCacheInterface) => Promise<void>;
  }
}
