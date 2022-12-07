import fp from "fastify-plugin";
import {
  Evaluation,
  EvaluationSchema,
  Evaluator,
  EvaluatorSchema,
  FacebookUser,
  FacebookUserSchema,
  Org,
  OrgSchema,
  Profile,
  ProfileSchema,
  RedditUser,
  RedditUserSchema,
  Registration,
  RegistrationSchema,
  Tag,
  TagSchema,
  TwitterUser,
  TwitterUserSchema,
  Badge,
  BadgeSchema,
} from "../schemas";
import * as mongoose from "mongoose";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";

import fastifyRedis from "@fastify/redis";
import type { LinkType } from "../routes/verify/types";

import { auth } from "../utils/initFirebase";
import { DecodedIdToken } from "firebase-admin/auth";

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

interface SetUserLinksInterface {
  email: string;
  org?: string;
  links: LinkType[];
  upsert?: boolean; // if true, creates users if they don't exist
}

interface ClearUserCacheInterface {
  email: string;
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  fastify.register(fastifyCors, {
    origin: true,
    exposedHeaders: ["Content-Range"],
  });

  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
    sign: {
      expiresIn: "1h",
    },
  });

  fastify.decorate("generateJwt", (email: string, idtoken: string) => {
    return fastify.jwt.sign({ email, idtoken });
  });

  const db = await mongoose
    .connect(process.env.MONGODB_CONN!, {
      dbName: process.env.MONGODB_DB,
    })
    .then((conn) => {
      fastify.decorate("db", {
        Profile: conn.model("Profile", ProfileSchema),
        FacebookUser: conn.model("FacebookUser", FacebookUserSchema),
        TwitterUser: conn.model("TwitterUser", TwitterUserSchema),
        RedditUser: conn.model("RedditUser", RedditUserSchema),
        Registration: conn.model("Registration", RegistrationSchema),
        Evaluator: conn.model("Evaluator", EvaluatorSchema),
        Evaluation: conn.model("Evaluation", EvaluationSchema),
        Tag: conn.model("Tag", TagSchema),
        Org: conn.model("Org", OrgSchema),
        Badge: conn.model("Badge", BadgeSchema),
      });
      return conn;
    })
    .catch((err) => {
      console.log("database error", err);
    });

  if (!db) {
    throw new Error("Database connection failed");
  }

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
    async ({ email, org, links, upsert }: SetUserLinksInterface) => {
      const profile = await fastify.db.Profile.findOne({
        email: email,
      }).lean();
      if (!profile) {
        throw new Error("Profile not found");
      }
      for (const link of links) {
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
                  $push: {
                    orgs: org,
                  },
                  $set: {
                    name: profile.name,
                    link: splicedFbLink,
                  },
                }
              );
            } else if (upsert) {
              const facebookUser = new fastify.db.FacebookUser({
                name: profile.name,
                email: profile.email,
                orgs: [org],
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
              fastify.redis.set(fbLink, `[${org}]`, "EX", 60 * 60 * 24);
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
                  $push: {
                    orgs: org,
                  },
                  $set: {
                    name: profile.name,
                    link: splicedTwitterLink,
                  },
                }
              );
            } else if (upsert) {
              const twitterUser = new fastify.db.TwitterUser({
                name: profile.name,
                email: profile.email,
                orgs: [org],
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
              fastify.redis.set(twitterLink, `[${org}]`, "EX", 60 * 60 * 24);
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
                  $push: {
                    orgs: org,
                  },
                  $set: {
                    link: splicedRedditLink,
                    name: profile.name,
                  },
                }
              );
            } else if (upsert) {
              const redditUser = new fastify.db.RedditUser({
                name: profile.name,
                email: profile.email,
                orgs: [org],
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
              fastify.redis.set(redditLink, `[${org}]`, "EX", 60 * 60 * 24);
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

  fastify.register(fastifyRedis, {
    host: process.env.REDIS_HOST!,
    port: 6379,
  });
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    generateJwt: (email: string, idtoken: string) => string;
    verifyFbAuth: (token: string) => any;
    SetUserLinks: ({}: SetUserLinksInterface) => Promise<void>;
    ClearUserCache: ({}: ClearUserCacheInterface) => Promise<void>;
    db: {
      Profile: mongoose.Model<Profile>;
      FacebookUser: mongoose.Model<FacebookUser>;
      TwitterUser: mongoose.Model<TwitterUser>;
      RedditUser: mongoose.Model<RedditUser>;
      Registration: mongoose.Model<Registration>;
      Evaluator: mongoose.Model<Evaluator>;
      Evaluation: mongoose.Model<Evaluation>;
      Tag: mongoose.Model<Tag>;
      Org: mongoose.Model<Org>;
      Badge: mongoose.Model<Badge>;
    };
  }
  interface FastifyRequest {}
}
