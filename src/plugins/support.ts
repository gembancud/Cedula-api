import fp from "fastify-plugin";
import { User, UserSchema } from "../schemas/index";
import * as mongoose from "mongoose";
import fastifyJwt from "@fastify/jwt";
import fastifyCors from "@fastify/cors";
import { fastifyRequestContextPlugin } from "@fastify/request-context";

import { auth } from "../utils/initFirebase";

import multer from "fastify-multer";

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  fastify.register(fastifyRequestContextPlugin);

  fastify.register(fastifyCors, {
    origin: true,
  });

  fastify.register(fastifyJwt, {
    secret: "supersecret",
    sign: {
      expiresIn: "1h",
    },
  });

  fastify.decorate("generateJwt", (email: string) => {
    return fastify.jwt.sign({ email });
  });

  const db = await mongoose
    .connect("mongodb://root:example@localhost:27017", {
      dbName: "cedula",
    })
    .then((conn) => {
      fastify.decorate("db", {
        User: conn.model("User", UserSchema),
      });
      return conn;
    })
    .catch((err) => {
      console.log(err);
    });

  if (!db) {
    throw new Error("Database connection failed");
  }

  fastify.decorate("verifyFbAuth", async (token: string) => {
    const decodedToken = await auth.verifyIdToken(token).catch((error) => {
      console.error(error);
      return error;
    });
    if (decodedToken != null) {
      return decodedToken.uid;
    }
  });

  fastify.register(multer.contentParser);
});

// When using .decorate you have to specify added properties for Typescript
declare module "fastify" {
  export interface FastifyInstance {
    generateJwt: (email: string) => string;
    verifyFbAuth: (token: string) => string;
    db: {
      User: mongoose.Model<User>;
    };
  }
}

declare module "@fastify/request-context" {
  interface RequestContextData {
    user: User;
  }
}
