import { FastifyPluginAsync } from "fastify";
import { OrgGetOptions, OrgPostBody, OrgPostOptions } from "./types";

const org: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", OrgGetOptions, async function (request, reply) {
    const orgs = await fastify.db.Org.find().lean();
    return reply.status(200).send({ orgs });
  });

  fastify.post<{ Body: OrgPostBody }>(
    "/",
    OrgPostOptions,
    async function (request, reply) {
      try {
        const {
          password,
          name,
          badge,
          image,
          access,
          description,
          requirements,
          evaluatorcount,
        } = request.body;

        if (password !== process.env.ADMIN_PASSWORD)
          return reply.forbidden("Invalid password");

        const docBadge = new fastify.db.Badge({
          name: "default",
          org: name,
          link: badge,
          description: "Default badge",
        });
        await docBadge.save();

        const org = new fastify.db.Org({
          name,
          badge,
          image,
          access,
          description,
          requirements,
          evaluatorcount,
        });
        org.save((err, org) => {
          if (err || !org) {
            return reply.internalServerError("Error saving org to db");
          }
        });
        return reply.status(201).send("Org created");
      } catch (err) {
        console.log(err);
        return reply.internalServerError("Error saving org");
      }
    }
  );
};

export default org;
