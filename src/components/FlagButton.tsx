"use client";

import { useState } from "react";

interface FlagButtonProps {
  postId: string;
  userId: string;
}
export default function FlagButton({ postId, userId }: FlagButtonProps) {
  const [flagged, setFlagged] = useState(false);

  const handleFlag = async () => {
    if (!userId) {
      alert("You must be logged in to flag posts.");
      return;
    }

    try {
      if (!flagged) {
        // TODO: Call POST /api/flags with { postId, userId }
        setFlagged(true);
      } else {
        // TODO: Call DELETE /api/flags with { postId, userId }
        setFlagged(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleFlag}
      className={`text-sm font-medium ${
        flagged ? "text-red-600" : "text-gray-500"
      }`}
    >
      🚩 {flagged ? "Flagged" : "Flag"}
    </button>
  );
}
