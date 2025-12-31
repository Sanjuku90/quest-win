import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { authStorage } from "./storage";
import { db } from "../../db";
import { sessions } from "@shared/schema";
import { eq, lt } from "drizzle-orm";

class DrizzleStore extends session.Store {
  async get(sid: string, callback: (err: any, session?: any) => void) {
    try {
      const [session] = await db.select().from(sessions).where(eq(sessions.sid, sid));
      if (!session) return callback(null, null);
      if (session.expire < new Date()) {
        await this.destroy(sid, () => {});
        return callback(null, null);
      }
      callback(null, JSON.parse(session.sess));
    } catch (err) {
      callback(err);
    }
  }

  async set(sid: string, sess: any, callback?: (err?: any) => void) {
    try {
      const expire = sess.cookie.expires ? new Date(sess.cookie.expires) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const sessionData = {
        sid,
        sess: JSON.stringify(sess),
        expire,
      };
      const [existing] = await db.select().from(sessions).where(eq(sessions.sid, sid));
      if (existing) {
        await db.update(sessions).set(sessionData).where(eq(sessions.sid, sid));
      } else {
        await db.insert(sessions).values(sessionData);
      }
      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await db.delete(sessions).where(eq(sessions.sid, sid));
      if (callback) callback();
    } catch (err) {
      if (callback) callback(err);
    }
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  return session({
    secret: process.env.SESSION_SECRET || "default_secret",
    store: new DrizzleStore(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
      try {
        const user = await authStorage.getUserByEmail(email);
        if (!user || user.password !== password) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, cb) => cb(null, user.id));
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await authStorage.getUser(id);
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, username } = req.body;
      const existingUser = await authStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await authStorage.upsertUser({
        email,
        password,
        username,
        id: crypto.randomUUID(),
      });
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        res.json(user);
      });
    } catch (err) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
