import { redirect } from "next/navigation";
import * as zfd from "zod-form-data";
import auth from "~/server/auth";
import { db } from "~/server/db";
import { posts } from "~/server/db/schema";
import Fieldset from "./Fieldset";
import { headers } from "next/headers";
import {QuillDeltaToHtmlConverter} from "quill-delta-to-html";

const schema = zfd.formData({
  content: zfd.text(),
  tasg: zfd.repeatableOfType(zfd.text()),
});

async function action(data: FormData) {
  "use server";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session === null) {
    redirect("/");
  }

  await db.insert(posts).values({
    content: new QuillDeltaToHtmlConverter(JSON.parse((await schema.parseAsync(data)).content), {}).convert(),
    authorId: session.user.id,
  });

  redirect("/");
}

export default async function Draft() {
  const tags = await db.query.tags.findMany();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  

  if (session === null) {
    redirect("/");
  }

  return (
    <form action={action}>
      <Fieldset tags={tags} />
    </form>
  );
}
