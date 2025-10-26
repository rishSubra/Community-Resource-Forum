import { db } from "~/server/db";
import { profiles, users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { getSessionUser } from "~/server/auth";
import Link from "next/link";

//This is the form field page where users are redirected to to edit their profiles.

export default async function EditProfilePage() {
  const session = await getSessionUser();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-semibold mb-4">You must be signed in</h1>
        <Link href="/" className="rounded-md bg-sky-700 px-4 py-2 text-white hover:bg-sky-600">Go Home</Link>
      </div>
    );
  }

  const userResult = await db
    .select({ profile: profiles, user: users })
    .from(users)
    .innerJoin(profiles, eq(profiles.id, users.id))
    .where(eq(users.id, session.userId))
    .limit(1);

  const data = userResult[0];
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl font-semibold mb-4">Profile not found.</h1>
        <Link href="/" className="rounded-md bg-sky-700 px-4 py-2 text-white hover:bg-sky-600">Go Home</Link>
      </div>
    );
  }

  const { profile } = data;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>
      <form action="/api/profile" method="post" className="space-y-4">
        <input type="hidden" name="id" defaultValue={profile.id} />
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input name="name" defaultValue={profile.name} className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea name="bio" defaultValue={profile.bio ?? ""} rows={5} className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Image URL</label>
          <input name="image" defaultValue={profile.image ?? ""} className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">LinkedIn</label>
          <input name="linkedin" defaultValue={profile.linkedin ?? ""} className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">GitHub</label>
          <input name="github" defaultValue={profile.github ?? ""} className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Personal Site</label>
          <input name="personalSite" defaultValue={profile.personalSite ?? ""} className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="rounded-md bg-sky-700 px-4 py-2 text-white hover:bg-sky-600">Save</button>
          <Link href="/profile" className="text-sm text-gray-600 hover:underline">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
