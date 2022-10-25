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
  Registration,
  RegistrationSchema,
  Tag,
  TagSchema,
  TwitterUser,
  TwitterUserSchema,
} from "../schemas";
import * as mongoose from "mongoose";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
// import { fastifyRequestContextPlugin } from "@fastify/request-context";

import fastifyRedis from "@fastify/redis";

import { auth } from "../utils/initFirebase";
import { DecodedIdToken } from "firebase-admin/auth";

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  // fastify.register(fastifyRequestContextPlugin);

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
        FacebookUser: conn.model("FacebookUser", FacebookUserSchema),
        TwitterUser: conn.model("TwitterUser", TwitterUserSchema),
        Registration: conn.model("Registration", RegistrationSchema),
        Evaluator: conn.model("Evaluator", EvaluatorSchema),
        Evaluation: conn.model("Evaluation", EvaluationSchema),
        Tag: conn.model("Tag", TagSchema),
        Org: conn.model("Org", OrgSchema),
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
    db: {
      FacebookUser: mongoose.Model<FacebookUser>;
      TwitterUser: mongoose.Model<TwitterUser>;
      Registration: mongoose.Model<Registration>;
      Evaluator: mongoose.Model<Evaluator>;
      Evaluation: mongoose.Model<Evaluation>;
      Tag: mongoose.Model<Tag>;
      Org: mongoose.Model<Org>;
    };
  }
  interface FastifyRequest {
    // files: any;
  }
}

// declare module "@fastify/request-context" {
//   interface RequestContextData {
//     user: User;
//   }
// }
