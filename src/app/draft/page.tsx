import { redirect } from "next/navigation";
import { QuillDeltaToHtmlConverter } from "quill-delta-to-html";
import { PiPaperPlaneTiltBold } from "react-icons/pi";
import * as z from "zod";
import * as zfd from "zod-form-data";
import { getSessionUser } from "~/auth/server";
import { db } from "~/db";
import { posts, tagsToPosts } from "~/db/schema";
import Editor from "../../components/Editor";
import SelectEvent from "../../components/SelectEvent";
import SelectProfile from "../../components/SelectProfile";
import SelectTags from "../../components/SelectTags";

const schema = zfd.formData({
  authorId: zfd.text(),
  tagId: zfd.repeatableOfType(zfd.text()),
  eventId: zfd.text(z.string().optional()),
  content: zfd.text().transform((s, ctx) => {
    try {
      const obj: unknown = JSON.parse(s);

      if (obj instanceof Array) {
        return new QuillDeltaToHtmlConverter(obj, {}).convert();
      }

      throw new Error("Parsed JSON not instance of array");
    } catch (e) {
      console.error(e);
      ctx.addIssue({ code: "custom", message: "Invalid JSON" });
      return z.NEVER;
    }
  }),
});

export default async function Draft() {
  const tags = await db.query.tags.findMany();
  const session = await getSessionUser({
    with: {
      profile: {
        with: {
          events: true,
        },
      },
      organizations: {
        with: {
          organization: {
            with: {
              events: true,
            },
          },
        },
      },
    },
  });

  async function action(data: FormData) {
    "use server";

    if (session === null) {
      redirect("/sign-in");
    }

    const {
      content,
      tagId: tags,
      authorId,
      eventId,
    } = await schema.parseAsync(data);

    if (
      authorId !== session.userId &&
      !session.user.organizations.some(
        (org) => org.organizationId === authorId && org.role !== "member",
      )
    ) {
      redirect("/sign-in");
    }

    await db.transaction(async (tx) => {
      const [insertedPost] = await tx
        .insert(posts)
        .values({
          authorId,
          eventId,
          content,
        })
        .$returningId();

      if (!insertedPost) {
        tx.rollback();
        return;
      }

      await tx.insert(tagsToPosts).values(
        tags.map((tagId) => ({
          tagId,
          postId: insertedPost.id,
        })),
      );
    });

    redirect("/");
  }

  if (session === null) {
    redirect("/sign-in");
  }

  const organizationProfiles = session.user.organizations
    .filter((rel) => rel.role === "officer" || rel.role === "owner")
    .map((rel) => rel.organization);

  const events = [session.user.profile, ...organizationProfiles].flatMap(
    (p) => p.events,
  );

  return (
    <form
      action={action}
      className="flex flex-col items-center gap-y-6 px-8 py-6 pb-24 bg-gray-50 mx-auto"
    >
      <h1 className="text-2xl font-bold">Create a Post</h1>

      <SelectProfile
        profiles={[session.user.profile, ...organizationProfiles]}
      />

      <SelectTags tags={tags} />
      <Editor />
      <SelectEvent events={events} />

      <button className="flex items-center gap-3 rounded-sm border-b-2 border-sky-900 bg-sky-800 px-6 py-1 text-lg font-medium text-white shadow-sm ring-1 ring-sky-950 transition-colors hover:bg-sky-50 hover:text-sky-800 focus:mt-0.5 focus:border-b-0">
        <span className="contents">
          Publish <PiPaperPlaneTiltBold />
        </span>
      </button>
    </form>
  );
}
