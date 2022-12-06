import { FastifyPluginAsync } from "fastify";
import {
  OrgGetMeOptions,
  OrgGetOptions,
  OrgPostBody,
  OrgPostOptions,
} from "./types";

const org: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", OrgGetOptions, async function (request, reply) {
    const orgs = await fastify.db.Org.find();
    const orgsList = orgs.map((org) => {
      return {
        ...org.toObject(),
        badge: org.default_badge_link,
      };
    });
    return { orgs: orgsList };
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
          default_badge_link: badge,
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
          return {
            ...org!.toObject(),
            badge: org?.default_badge_link,
          };
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
