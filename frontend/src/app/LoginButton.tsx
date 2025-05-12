"use client";

import { Flex, Menu } from "@mantine/core";
import Link from "next/link";

interface Props {
  className?: string;
}

export function LoginButton({ className }: Props) {
  return (
    <Flex gap="sm">
        {/* <Link href="/api/auth/login">Sign In</Link> */}
        <Menu
          trigger="hover"
          closeOnItemClick={false}
          openDelay={100}
          closeDelay={400}
        >
          <Menu.Target>
            <h1 className="cursor-pointer">Sign In</h1>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Type of Sign In</Menu.Label>
            <Menu.Item
              component={Link}
              prefetch={false}
              href={{
                pathname: "/login",
              }}
            >
              Log In
            </Menu.Item>
            <Menu.Item
              component={Link}
              prefetch={false}
                href={{
                  pathname: "/register/student",
                }}
              >
                Sign Up
              </Menu.Item>
            </Menu.Dropdown>
        </Menu>
      </Flex>

    // <Link
    //   className={`group bg-white text-slate-900 relative flex w-fit items-center justify-center overflow-hidden 
    //         rounded-md border-2 border-slate-900 px-4 py-1 
    //         transition-transform ease-out hover:scale-[101%] ${className}`}
    //   href={`/login`}
    // >
    //   <span
    //     className={`absolute inset-0 -z-10 h-full rounded bg-purple-300 transition-transform duration-300 
    //         ease-in-out group-hover:translate-y-0 translate-y-8`}
    //   ></span>
    //   <span className="font-bold">Sign In</span>
    // </Link>
  );
}
