"use client";

import { Combobox, ComboboxInput, type TabGroupProps } from "@headlessui/react";
import type { tags as tagsTable } from "~/server/db/schema";

interface Props {
  tags: (typeof tagsTable)["$inferSelect"];
}

export default function Editor({ tags }: Props) {
  return (
    <fieldset className="flex flex-col gap-4 items-center py-4">
      <Combobox>
        <ComboboxInput></ComboboxInput>
      </Combobox>

      <textarea
        placeholder="Write your post..."
        className="rounded-sm border border-black"
        name="content"
        required
      />

      <button className="bg-gray-100 px-3 py-0.5 rounded-sm border-b border-gray-300 hover:bg-gray-200 transition-colors ring ring-gray-400 shadow-sm">Submit</button>
    </fieldset>
  );
}
