import { redirect } from "next/navigation";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import * as zfd from "zod-form-data";
import { getSessionUser } from "~/server/auth";
import { db } from "~/server/db";
import Editor from "./Editor";
import SelectProfile from "./SelectProfile";
import SelectTags from "./SelectTags";

const schema = zfd.formData({
  content: zfd.text(),
  tasg: zfd.repeatableOfType(zfd.text()),
});

async function action(data: FormData) {
  "use server";

  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });

  // if (session === null) {
  //   redirect("/");
  // }

  // await db.insert(posts).values({
  //   content: new QuillDeltaToHtmlConverter(
  //     JSON.parse((await schema.parseAsync(data)).content),
  //     {},
  //   ).convert(),
  //   authorId: session.user.id,
  // });

  redirect("/");
}

export default async function Draft() {
  const tags = await db.query.tags.findMany();
  const session = await getSessionUser({
    with: {
      profile: true,
      organizations: {
        with: {
          organization: true,
        },
      },
    },
  });

  if (session === null) {
    redirect("/");
  }

  return (
    <form
      action={action}
      className="flex flex-col items-center gap-y-6 px-8 py-6"
    >
      <h1 className="text-2xl font-bold">Create a Post</h1>

      <SelectProfile
        profiles={[
          session.user.profile,
          ...session.user.organizations
            .filter((rel) => rel.role === "officer" || rel.role === "owner")
            .map((rel) => rel.organization),
        ]}
      />
      <SelectTags tags={tags} />
      <Editor />

      <button className="flex items-center gap-3 rounded-sm border-b-2 border-sky-900 bg-sky-800 px-6 py-1 text-lg font-medium text-white shadow-sm ring-1 ring-sky-950 transition-colors hover:bg-sky-50 hover:text-sky-800 focus:mt-0.5 focus:border-b-0">
        <span className="contents">
          Publish <PiPaperPlaneTiltBold />
        </span>
      </button>
    </form>
  );
}
