import Image from "next/image";
import Link from "next/link";
import auth from "~/server/auth";
import devdog from "~/assets/devdog.png";
import SignIn from "./SignIn";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import Avatar from "./Avatar";
import { headers } from "next/headers";

export default async function Navigation() {
  const session = await auth.api.getSession({
    headers: await headers(),
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
            <Avatar {...session.user} />
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
        <SignIn />
      )}
    </nav>
  );
}
