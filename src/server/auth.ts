import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "~/env";
import { db } from "./db";
import { profiles } from "./db/schema";
import { nextCookies } from "better-auth/next-js";

const auth = betterAuth({
  plugins: [nextCookies()],
  socialProviders: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      hd: "uga.edu",
    },
  },
  database: drizzleAdapter(db, { provider: "mysql", usePlural: true }),
  databaseHooks: {
    user: {
      create: {
        async before(user) {
          const [insertedProfile] = await db
            .insert(profiles)
            .values({
              name: user.name,
              image: user.image,
            })
            .$returningId();

          return {
            data: {
              ...user,
              id: insertedProfile!.id,
            },
          };
        },
      },
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
});

export default auth;
