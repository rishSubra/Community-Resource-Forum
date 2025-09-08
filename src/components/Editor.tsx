"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill, { type EmitterSource } from "react-quill-new";
import type Delta from "quill-delta";
import "react-quill-new/dist/quill.snow.css";

export default function Editor() {
  const [value, setValue] = useState("{}");

  const handleChange = useCallback(
    (
      _html: string,
      _delta: Delta,
      _source: EmitterSource,
      editor: ReactQuill.UnprivilegedEditor,
    ) => {
      setValue(JSON.stringify(editor.getContents().ops));
    },
    [],
  );

  return (
    <div className="relative w-full bg-gray-100 px-8 py-4">
      <input type="hidden" name="content" value={value} />
      <ReactQuill
        className="flex h-64 flex-col rounded-xs bg-white shadow-xs *:overflow-y-hidden"
        theme="snow"
        onChange={handleChange}
      />
    </div>
  );
}
