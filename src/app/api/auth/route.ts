import { eq } from "drizzle-orm";
import { google } from "googleapis";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import { profiles, sessions, users } from "~/server/db/schema";

export async function GET(request: NextRequest) {
  const googleOAuth2 = new google.auth.OAuth2(
    env.AUTH_GOOGLE_ID,
    env.AUTH_GOOGLE_SECRET,
    new URL("/api/auth", request.nextUrl).toString(),
  );

  const code = request.nextUrl.searchParams.get("code");

  if (code === null) {
    notFound();
  }

  const { tokens } = await googleOAuth2.getToken(code);
  googleOAuth2.setCredentials(tokens);

  const profile = await google
    .oauth2({
      version: "v2",
      auth: googleOAuth2,
    })
    .userinfo.get({
      fields: "name,email",
    });

  if (!profile.data.email) {
    notFound();
  }

  const email = profile.data.email;

  const { id } =
    (await db.query.users.findFirst({
      where: eq(users.email, email),
    })) ??
    (await db.transaction(async (tx) => {
      const [insertedProfile] = await tx
        .insert(profiles)
        .values({
          name: profile.data.name ?? "UGA Student",
          image: profile.data.picture,
          type: "user",
        })
        .$returningId();

      const id = insertedProfile?.id;

      if (id === undefined) {
        throw tx.rollback();
      }

      await tx.insert(users).values({
        id,
        email,
      });

      return { id };
    }));

  const [insertedSession] = await db
    .insert(sessions)
    .values({
      userId: id,
      userAgent: request.headers.get("user-agent"),
    })
    .$returningId();

  if (!insertedSession) {
    notFound();
  }

  console.log(insertedSession.token);
  (await cookies()).set("session", insertedSession.token);
  redirect("/");
}
