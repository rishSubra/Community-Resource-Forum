import "~/styles/globals.css";

import { type Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import devdog from "./devdog.png";
import SignIn from "./SignIn";

export const metadata: Metadata = {};

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable}`}>
      <body>
        <main className="min-h-screen border-t-4 border-sky-800">
          <nav className="flex items-center justify-between bg-gray-100 px-3 py-3">
            <Link className="text-3xl" href="/">
              <figure className="size-[1em]">
                <Image alt="Dev Dog" src={devdog} />
              </figure>
            </Link>

            <SignIn />
          </nav>

          {children}
        </main>
      </body>
    </html>
  );
}
