import { FastifyPluginAsync } from "fastify";
import {
  VerifyGetOneOptions,
  VerifyGetOneParams,
  VerifyGetOptions,
} from "./types";

const verify: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      const token = request.headers.authorization;
      if (!token) {
        throw new Error("No token");
      }
      const decodedAuthToken = fastify.verifyFbAuth(token);
      if (!decodedAuthToken)
        throw new Error("Next Firebase Auth: Cookie not authorized");
    } catch (err) {
      reply.unauthorized();
    }
  });

  fastify.get("/", VerifyGetOptions, async function (request, reply) {
    let authUser;
    try {
      const token = request.headers.authorization;
      authUser = await fastify.verifyFbAuth(token!);
    } catch (err) {
      return reply.status(401).send({ message: err });
    }
    console.log("");

    const docList = await fastify.db.Registration.find({
      evaluators: authUser.email,
    });
    const objList = docList.map((item) => {
      return { ...item.toObject(), id: item.applicant_email };
    });
    return reply
      .header("Content-Range", `0-9/${objList.length}`)
      .status(200)
      .send(objList);
  });

  fastify.get<{ Params: VerifyGetOneParams }>(
    "/:id",
    VerifyGetOneOptions,
    async function (request, reply) {
      let authUser;
      try {
        const token = request.headers.authorization;
        authUser = await fastify.verifyFbAuth(token!);
      } catch (err) {
        return reply.status(401).send({ message: err });
      }

      const doc = await fastify.db.Registration.findOne({
        applicant_email: request.params.id,
        evaluator: authUser.email,
      });

      if (!doc) {
        return reply.status(404).send({ message: "Not found" });
      }
      return reply
        .status(200)
        .send({ ...doc.toObject(), id: doc.applicant_email });
    }
  );
};

export default verify;
