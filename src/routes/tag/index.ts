import { FastifyPluginAsync } from "fastify";
import { TagGetOptions } from "./types";

const tag: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", TagGetOptions, async function (request, reply) {
    // If cached, return cached
    const cachetags = await fastify.redis.get("fb_tags");
    if (cachetags) {
      return {
        tags: JSON.parse(cachetags),
      };
    }
    const outTags: object[] = [];
    const docTags = await fastify.db.Tag.find();
    for (const docTag of docTags) {
      const { label, tag } = docTag;
      outTags.push({ label, tag });
    }
    fastify.redis.set("fb_tags", JSON.stringify(outTags), "EX", 60 * 60 * 24);

    return reply.status(200).send({
      tags: outTags,
    });

    // return {
    //   newsfeed_name_strong:
    //     "span.rse6dlih:not(.rrjlc0n4):not(.jwegzro5) > span:not([cedula_marked]),a:not([cedula_marked]) > strong:not([cedula_marked])",
    //   newsfeed_name:
    //     "span.rse6dlih:not(.rrjlc0n4):not(.jwegzro5) > span:not([cedula_marked]) > span:not([cedula_marked])",
    //   comment_name:
    //     "span.fxk3tzhb:not(.p8bhzyuu):not(.ewjwymqb ):not(.b2rh1bv3):not(.c7y9u1f0) > span:not([cedula_marked])",
    // };
  });
};

export default tag;
