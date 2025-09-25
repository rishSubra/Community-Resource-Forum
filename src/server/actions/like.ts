"use server";

import { and, eq, sql } from "drizzle-orm";
import * as zfd from "zod-form-data";
import { getSessionUser } from "../auth";
import { db } from "../db";
import { likes, posts } from "../db/schema";
import signIn from "./signIn";

interface PrevState {
  likeCount: number;
  likeStatus: boolean;
}

const schema = zfd.formData({
  postId: zfd.text(),
});

export default async function like(prevState: PrevState, formData: FormData) {
  const session = await getSessionUser();

  if (session === null) {
    await signIn();
    throw new Error("🍸 How did we get here?");
  }

  const { postId } = await schema.parseAsync(formData);

  return await db.transaction(async (tx) => {
    const [result] = await tx
      .delete(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, session.userId)));

    if (result.affectedRows > 0) {
      await tx
        .update(posts)
        .set({ likeCount: sql`${posts.likeCount} - 1` })
        .where(eq(posts.id, postId));

      return { likeCount: prevState.likeCount - 1, likeStatus: false };
    }

    await tx.insert(likes).values({ postId, userId: session.userId });
    await tx
      .update(posts)
      .set({ likeCount: sql`${posts.likeCount} + 1` })
      .where(eq(posts.id, postId));

    return { likeCount: prevState.likeCount + 1, likeStatus: true };
  });
}
