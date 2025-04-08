"use client";

import Link from "next/link";

interface Props {
  className?: string;
}

export function LoginButton({ className }: Props) {
  return (
    <Link
      className={`group bg-white text-slate-900 relative flex w-fit items-center justify-center overflow-hidden 
            rounded-md border-2 border-slate-900 px-4 py-1 
            transition-transform ease-out hover:scale-[101%] ${className}`}
      href={`/login`}
    >
      <span
        className={`absolute inset-0 -z-10 h-full rounded bg-yellow-300 transition-transform duration-300 
            ease-in-out group-hover:translate-y-0 translate-y-8`}
      ></span>
      <span className="font-bold">Sign In</span>
    </Link>
  );
}
