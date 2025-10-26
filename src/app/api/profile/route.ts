import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { profiles } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "~/server/auth";

export async function POST(req: Request) {
  const session = await getSessionUser();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.formData();
  const id = body.get("id");
  const name = body.get("name");
  const bio = body.get("bio");
  const image = body.get("image");
  const linkedin = body.get("linkedin");
  const github = body.get("github");
  const personalSite = body.get("personalSite");

  if (!id || id !== session.userId) {
    return NextResponse.json({ error: "Invalid profile id" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof name === "string") updates.name = name;
  if (typeof bio === "string") updates.bio = bio;
  if (typeof image === "string") updates.image = image;
  if (typeof linkedin === "string") updates.linkedin = linkedin;
  if (typeof github === "string") updates.github = github;
  if (typeof personalSite === "string") updates.personalSite = personalSite;

  try {
    await db.update(profiles).set(updates).where(eq(profiles.id, id));
    return NextResponse.redirect(new URL("/", req.url));
  } catch (err) {
    return NextResponse.json({ error: "Update failed", details: String(err) }, { status: 500 });
  }
}
