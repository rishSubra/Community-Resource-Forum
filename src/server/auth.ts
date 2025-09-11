import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "./db";
import { sessions } from "./db/schema";

/**
 * 
 * @param include 
 * @returns 
 */
export async function getSessionUser<
  T extends Exclude<
    ((Parameters<typeof db.query.sessions.findFirst>[0] & {})["with"] & {
      user: {};
    })["user"],
    true
  >,
>(include?: T) {
  const token = (await cookies()).get("session")?.value;

  if (!token) {
    return null;
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
    with: {
      user: include ?? true,
    }
  });

  return session ?? null;
}
