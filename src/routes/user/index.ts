import { FastifyPluginAsync } from "fastify";
import {
  RegisterOptions,
  RegisterBody,
  LoginOptions,
  LoginBody,
} from "./types";

const user: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get("/", async function (request, reply) {
    return "this is an example";
  });
  fastify.post<{ Body: RegisterBody }>(
    "/register",
    RegisterOptions,
    async function (request, reply) {
      const { email } = request.body;

      const user = new fastify.db.User({
        ...request.body,
      });

      user.save((err, user) => {
        if (err || !user) {
          fastify.httpErrors.createError();
        }
      });

      const token = fastify.generateJwt(email);
      return reply.status(201).send({ ...user.toObject(), token });
    }
  );
  fastify.post<{ Body: LoginBody }>(
    "/login",
    LoginOptions,
    async function (request, reply) {
      const { email } = request.body;
      const user = await fastify.db.User.findOne({ email });

      if (!user) {
        return reply.status(404).send({ message: "User not found" });
      }
      const token = fastify.generateJwt(email);
      return reply.status(200).send({ ...user.toObject(), token });
    }
  );
};

export default user;
