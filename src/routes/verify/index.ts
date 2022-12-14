import { FastifyPluginAsync } from "fastify";
import {
  VerifyGetOneOptions,
  VerifyGetOneParams,
  VerifyGetOptions,
  VerifyPostBody,
  VerifyPostOptions,
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
    try {
      const token = request.headers.authorization;
      const authUser = await fastify.verifyFbAuth(token!);
      const docRegistrationList = await fastify.db.Registration.find({
        evaluators: authUser.email,
      });

      const objList = await Promise.all(
        docRegistrationList.map(async (docRegistration) => {
          const docProfile = await fastify.db.Profile.findOne({
            email: docRegistration.email,
          });
          if (docProfile) {
            return {
              id: docProfile.email,
              ...docProfile.toObject(),
              ...docRegistration.toObject(),
            };
          } else {
            return reply.status(404).send({ error: "Profile not found" });
          }
        })
      );
      return reply
        .header("Content-Range", `0-9/${objList.length}`)
        .status(200)
        .send(objList);
    } catch (err) {
      return reply.status(401).send({ message: err });
    }
  });

  fastify.get<{ Params: VerifyGetOneParams }>(
    "/:id",
    VerifyGetOneOptions,
    async function (request, reply) {
      try {
        const token = request.headers.authorization;
        const authUser = await fastify.verifyFbAuth(token!);
        const docRegistration = await fastify.db.Registration.findOne({
          email: request.params.id,
          evaluator: authUser.email,
        });

        if (!docRegistration) {
          return reply.status(404).send({ message: "Registration not found" });
        }
        const docProfile = await fastify.db.Profile.findOne({
          email: docRegistration.email,
        });
        if (docProfile) {
          return reply.status(200).send({
            id: docProfile.email,
            ...docProfile.toObject(),
            ...docRegistration.toObject(),
          });
        } else {
          return reply.status(404).send({ error: "Profile not found" });
        }
      } catch (err) {
        return reply.status(401).send({ message: err });
      }
    }
  );

  fastify.post<{ Body: VerifyPostBody }>(
    "/",
    VerifyPostOptions,
    async function (request, reply) {
      try {
        const { email, org, evaluation, comment } = request.body;
        const token = request.headers.authorization;
        const authUser = await fastify.verifyFbAuth(token!);
        const registration = await fastify.db.Registration.findOne({
          email: email,
          org,
          evaluator: authUser.email,
        });
        if (!registration) {
          return reply.status(404).send({ message: "Registration not found" });
        }
        const profile = await fastify.db.Profile.findOne({
          email: email,
        }).lean();
        if (!profile) {
          return reply.status(404).send({ message: "Profile not found" });
        }

        const prevEvaluation = await fastify.db.Evaluation.findOne({
          email,
          org,
          evaluator: authUser.email,
        });
        if (prevEvaluation) {
          return reply
            .status(404)
            .send({ message: "Evaluation already exists, Use patch instead" });
        }

        const orgDoc = await fastify.db.Org.findOne({ name: org });
        if (!orgDoc) {
          return reply.status(404).send({ message: "Org not found" });
        }
        let evalNumber = parseInt(registration.evaluation);
        if (Number.isNaN(evalNumber)) evalNumber = 0;

        switch (evaluation) {
          case "accept":
            if (evalNumber + 1 >= orgDoc.evaluatorcount) {
              await fastify.db.Registration.updateOne(
                { email: email, org },
                {
                  $set: {
                    status: "accepted",
                    evaluation: (evalNumber + 1).toString(),
                  },
                }
              );
              fastify.SetUserLinks({ email, upsert: true });
            } else {
              await fastify.db.Registration.updateOne(
                { email: email, org },
                {
                  $set: {
                    evaluation: (evalNumber + 1).toString(),
                  },
                }
              );
            }
            break;
          case "reject":
            await fastify.db.Registration.updateOne(
              { email: email, org },
              {
                $set: {
                  status: "rejected",
                },
              }
            );
            break;
          case "waitlist":
            break;
          default:
            return reply.status(400).send({ message: "Invalid evaluation" });
        }

        const newEvaluation = new fastify.db.Evaluation({
          email: profile.email,
          org,
          evaluator: authUser.email,
          evaluation,
          comments: comment,
        });
        newEvaluation.save((err, evaluation) => {
          if (err || !evaluation) {
            return reply
              .status(500)
              .send({ message: "Evaluation saving to db failed!" });
          }
        });
      } catch (err) {
        return reply.status(401).send({ message: err });
      }
    }
  );
};

export default verify;
