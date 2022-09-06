import { FastifyPluginAsync } from "fastify";

const ask: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.addHook("onRequest", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.unauthorized();
    }
  });

  fastify.get("/", async function (request, reply) {
    return "this is an example";
  });
};

export default ask;
