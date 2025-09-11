import { google } from "googleapis";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { env } from "~/env";

export function GET(request: NextRequest) {
  const googleOAuth2 = new google.auth.OAuth2(
    env.AUTH_GOOGLE_ID,
    env.AUTH_GOOGLE_SECRET,
    new URL("/api/auth/callback/google", request.nextUrl).toString(),
  );

  redirect(
    googleOAuth2.generateAuthUrl({
      access_type: "online",
      hd: "uga.edu",
      include_granted_scopes: true,
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ],
    }),
  );
}
