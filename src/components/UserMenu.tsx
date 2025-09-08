"use client";

import type { Session } from "next-auth";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import Avatar from "./Avatar";
import Link from "next/link";

interface Props {
  session: Session;
}

export default function UserMenu({ session }: Props) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger className="text-[2rem]">
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
  );
}
