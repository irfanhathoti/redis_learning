import { RedisStore } from "connect-redis";
import session from "express-session";
import redisClient from "./redis";
import { Request } from "express";

const SESSION_TTL = Number(process.env.SESSION_TTL || 86400);

export const SESSION_COOKIE_NAME = process.env.SESSION_NAME || "sid";

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not defined in environment variables");
}

// logout has to clear the cookie with these same options or the browser keeps it
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

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
  name: SESSION_COOKIE_NAME,
  store: redisStore,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: {
    ...sessionCookieOptions,
    maxAge: SESSION_TTL * 1000,
  },
});

export default sessionMiddleWare;
