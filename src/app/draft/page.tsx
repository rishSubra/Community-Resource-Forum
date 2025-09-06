import { redirect } from "next/navigation";
import * as zfd from "zod-form-data";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { posts } from "~/server/db/schema";
import Editor from "./Editor";

const schema = zfd.formData({
  content: zfd.text(),
});

async function action(data: FormData) {
  "use server";

  const session = await auth();

  if (session === null) {
    redirect("/");
  }

  await db.insert(posts).values({
    content: (await schema.parseAsync(data)).content,
    authorId: session.user.id,
  });

  redirect("/");
}

export default async function Draft() {
  const session = await auth();
  const tags = await db.query.tags.findMany();

  if (session === null) {
    redirect("/");
  }

  return (
    <form action={action}>
      <Editor />
    </form>
  );
}
