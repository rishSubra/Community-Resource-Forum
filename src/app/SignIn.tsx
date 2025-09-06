"use client";

import { signIn } from "next-auth/react";
import { PiSignInBold } from "react-icons/pi";

export default function SignIn() {
  return (
    <button
      className="flex items-center gap-1.5 rounded-sm border-2 border-sky-800 bg-sky-800 px-3 py-0.5 text-sm font-semibold text-white shadow-sm ring-1 ring-sky-950 transition-all hover:bg-sky-50 hover:text-sky-800 hover:shadow-md"
      onClick={() => signIn("google")}
    >
      <span className="contents">
        Sign In <PiSignInBold />
      </span>
    </button>
  );
}
