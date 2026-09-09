import { RedisStore } from "connect-redis";
import session from "express-session";
import redisClient from "./redis";
import { Request } from "express";

const SESSION_TTL = Number(process.env.SESSION_TTL || 86400);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "sess:",
});

export const regenerateSession = (req: Request): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
};

const sessionMiddleWare = session({
  name: process.env.SESSION_NAME || "sid",
  store: redisStore,
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL * 1000,
  },
});

export default sessionMiddleWare;
