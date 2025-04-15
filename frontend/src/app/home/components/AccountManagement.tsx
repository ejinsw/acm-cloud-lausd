"use client";

import { Button, Flex, Menu } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


interface Props {
  type?: string;
  /* TODO: Add Additional Props Here */
}

export function AccountManagement({ type }: Props) {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, [router]) 
  

  return (
    <>
      <Flex gap="sm">
        <Link href="/api/auth/login">Login</Link>
        <Menu trigger="hover" closeOnItemClick={false} openDelay={100} closeDelay={400}>
          <Menu.Target>
            <h1 className="cursor-pointer">Register</h1>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Type of Account</Menu.Label>
            <Menu.Item>
              <Link
                prefetch={false}
                href={{
                  pathname: "/register",
                  query: {
                    isStudent: true,
                  },
                }}
              >
                Student
              </Link>
            </Menu.Item>
            <Menu.Item>
              <Link
                prefetch={false}
                href={{
                  pathname: "/register",
                  query: {
                    isStudent: false,
                  },
                }}
              >
                Teacher
              </Link>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Flex>
    </>
  );
}
