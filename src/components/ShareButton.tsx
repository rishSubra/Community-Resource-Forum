"use client";

import { useState, useEffect, useRef } from "react";
import { PiShareFatBold } from "react-icons/pi";

interface Props {
  link: string;
}

export default function ShareButton({ link }: Props) {
  const [open, setOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    setIsCopied(true);
    setOpen(false);
    setTimeout(() => setIsCopied(false), 3000);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="flex items-center gap-2 rounded-sm px-2 py-1 hover:bg-sky-100"
        onClick={() => setOpen(!open)}
      >
        <PiShareFatBold />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg">
          <button
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={copyLink}
          >
            Copy link
          </button>
        </div>
      )}
      {isCopied && (
        <div className="fixed right-4 bottom-4 z-50 flex items-start gap-2 rounded-lg border border-green-300 bg-green-100 p-4 text-green-800 shadow-lg">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}
