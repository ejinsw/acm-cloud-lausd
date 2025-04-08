"use client";

import { AppShell, Burger, Center, Group, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { LoginButton } from "./LoginButton";

interface Props {
  children?: React.ReactNode;
}

export function Shell({ children }: Props) {
  const [opened, { toggle }] = useDisclosure();
  const user = null;

  return (
    <AppShell
      header={{ height: 96 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group
          justify="space-between"
          align="center"
          className="px-4 h-full w-full"
        >
          <Link
            href="/"
            className="tracking-tighter uppercase text-xl font-extrabold font-sans text-black hover:scale-[101%] transition-transform duration-100 ease-out"
          >
            Find-a-Tutor
          </Link>

          <Group gap="md" className="h-full" visibleFrom="md">
            <Link href="/home">Home</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
            {!user && <LoginButton />}
          </Group>

          <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className="flex flex-col" hiddenFrom="md">
        <UnstyledButton
          component={Link}
          href="/home"
          className={"flex items-center h-12 hover:bg-neutral-50"}
          onClick={toggle}
        >
          <Center className="px-4">Home</Center>
        </UnstyledButton>
        <UnstyledButton
          component={Link}
          href="/contact"
          className={"flex items-center h-12 hover:bg-neutral-50"}
          onClick={toggle}
        >
          <Center className="px-4">Contact</Center>
        </UnstyledButton>
        <UnstyledButton
          component={Link}
          href="/about"
          className={"flex items-center h-12 hover:bg-neutral-50"}
          onClick={toggle}
        >
          <Center className="px-4">About</Center>
        </UnstyledButton>
        {!user && <LoginButton className="mx-4" />}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>

      <AppShell.Footer></AppShell.Footer>
    </AppShell>
  );
}
