import * as Dropdown from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { PiSignInBold } from "react-icons/pi";
import devdog from "~/assets/devdog.png";
import Avatar from "./Avatar";
import { getSessionUser } from "~/server/auth";

export default async function Navigation() {
  const session = await getSessionUser({
    with: {
      profile: true,
    },
  });

  return (
    <nav className="flex items-center justify-between bg-gray-100 px-3 py-3">
      <Link className="text-3xl" href="/">
        <figure className="size-[1em]">
          <Image alt="Dev Dog" src={devdog} />
        </figure>
      </Link>

      {session ? (
        <Dropdown.Root>
          <Dropdown.Trigger className="text-[2rem] leading-none">
            <Avatar {...session.user.profile} />
          </Dropdown.Trigger>

          <Dropdown.Portal>
            <Dropdown.Content>
              <Dropdown.Item asChild>
                <Link href="/draft" className="">
                  Create New Post
                </Link>
              </Dropdown.Item>
            </Dropdown.Content>
          </Dropdown.Portal>
        </Dropdown.Root>
      ) : (
        <Link
          className="flex cursor-default items-center gap-1.5 rounded-sm border-b-2 border-sky-900 bg-sky-800 px-4 py-1 text-sm font-medium text-white shadow-sm ring-1 ring-sky-950 transition-colors hover:bg-sky-50 hover:text-sky-800 focus:mt-0.5 focus:border-b-0"
          href="/sign-in"
          prefetch={false}
        >
          <span className="contents">
            Sign In <PiSignInBold />
          </span>
        </Link>
      )}
    </nav>
  );
}
