"use client";

import { useCallback } from "react";
import { PiSignInBold } from "react-icons/pi";
import authClient from "~/lib/authClient";

export default function SignIn() {
  const signIn = useCallback(async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  }, []);

  return (
    <button
      className="flex items-center gap-1.5 rounded-sm border-b-2 border-sky-900 bg-sky-800 px-4 focus:mt-0.5 focus:border-b-0 py-1 text-sm font-medium text-white shadow-sm ring-1 ring-sky-950 transition-colors hover:bg-sky-50 hover:text-sky-800"
      onClick={signIn}
    >
      <span className="contents">
        Sign In <PiSignInBold />
      </span>
    </button>
  );
}
