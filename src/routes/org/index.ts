import { FastifyPluginAsync } from "fastify";
import { OrgGetMeOptions, OrgGetOptions } from "./types";

const org: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", OrgGetOptions, async function (request, reply) {
    const orgs = await fastify.db.Org.find();
    const orgsList = orgs.map((org) => {
      return { ...org.toObject() };
    });
    return { orgs: orgsList };
  });

  fastify.get("/me", OrgGetMeOptions, async function (request, reply) {
    try {
      const token = request.headers.authorization;
      const { email } = await fastify.verifyFbAuth(token!);

      const existing = await fastify.db.FacebookUser.findOne({ email });
      if (!existing) {
        return reply.status(409).send({ message: "User does not exist" });
      }
      const orgDocList = await Promise.all(
        existing.orgs.map(
          async (name) => await fastify.db.Org.findOne({ name })
        )
      );
      if (orgDocList !== null) {
        const orgList = orgDocList.map((org) => {
          return { ...org!.toObject() };
        });
        return reply.status(200).send({ orgs: orgList });
      } else {
        return reply.status(200).send({ orgs: [] });
      }
    } catch (err) {
      console.log(err);
      return reply.status(401).send({ message: err });
    }
  });
};

export default org;
