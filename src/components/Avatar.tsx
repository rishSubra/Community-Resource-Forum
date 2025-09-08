import { Fallback, Image, Root } from "@radix-ui/react-avatar";
import type { User } from "better-auth";

export default function Avatar(user: User) {
  return (
    <Root className="inline-flex size-[1em] items-center justify-center overflow-hidden rounded-full border border-gray-900 bg-gradient-to-br from-sky-400 to-sky-500 align-middle shadow-sm select-none">
      <Image
        alt={user.name ?? "The current signed-in user"}
        className="size-full rounded-[inherit] object-cover"
        src={user.image ?? undefined}
      />
      <Fallback className="font-bold text-gray-900">
        {user.name
          ?.split(" ")
          .map((name) => name.substring(0, 1))
          .join("")
          .toUpperCase() ?? ""}
      </Fallback>
    </Root>
  );
}
