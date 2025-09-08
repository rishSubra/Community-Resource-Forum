"use client";

import {
  PiPaperPlaneTiltBold,
  PiPencilSimpleBold,
  PiTagBold
} from "react-icons/pi";
import Editor from "~/components/Editor";
import SearchTags from "~/components/SearchTags";
import type { tags as tagsTable } from "~/server/db/schema";

type Tag = (typeof tagsTable)["$inferSelect"];

interface Props {
  tags: Tag[];
}

export default function Fieldset({ tags }: Props) {
  return (
    <fieldset className="flex flex-col items-center gap-6 py-4">
      <h1 className="text-2xl font-bold">Create a Post</h1>

      <div className="flex w-full flex-col gap-1 px-8">
        {/* TODO: add proper hookup with Combobox */}
        <label className="flex items-center gap-2 font-bold">
          <PiTagBold className="-scale-x-100" /> Tags
        </label>

        <SearchTags tags={tags} />
      </div>

      <div className="flex w-full flex-col gap-2">
        <label className="flex items-center gap-2 px-8 font-bold">
          <PiPencilSimpleBold /> Content
        </label>
        <Editor />
      </div>

      <button className="flex items-center gap-3 rounded-sm border-b-2 border-sky-900 bg-sky-800 px-6 py-1 text-lg font-medium text-white shadow-sm ring-1 ring-sky-950 transition-colors hover:bg-sky-50 hover:text-sky-800 focus:mt-0.5 focus:border-b-0">
        <span className="contents">Publish <PiPaperPlaneTiltBold /></span>
      </button>
    </fieldset>
  );
}
