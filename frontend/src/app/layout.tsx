"use client";

import {
  MantineProvider,
  AppShell,
  Box,
  Container,
  Group,
  Text,
  Anchor,
  ActionIcon,
  Divider,
  Burger,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, LogIn, UserCircle2 } from "lucide-react";
import { Theme } from "../theme";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import BottomNav from "../components/layout/BottomNav";
import { getRouteMeta, routes } from "./routes";
import { Notifications } from "@mantine/notifications";
import { AuthProvider, useAuth } from "../components/AuthProvider";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [opened, { toggle: toggleMobile }] = useDisclosure(false);
  const [sidebarCollapsed, { toggle: toggleSidebar }] = useDisclosure(false);
  const meta = getRouteMeta(pathname);
  const isPublic = meta.section === "public";
  const showFooter = isPublic;
  const shouldUseAppShell = meta.showShell;

  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, list) => {
      const href = `/${list.slice(0, index + 1).join("/")}`;
      const title = getRouteMeta(href).title;
      return {
        href,
        label:
          title === "Tutoring App"
            ? segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
            : title,
      };
    });

  if (!shouldUseAppShell) {
    return (
      <Box className="app-page-enter" mih="100vh">
        <Box className="app-topbar">
          <Container size="xl" h="100%">
            <Group h="100%" justify="space-between">
              <Anchor
                component={Link}
                href={routes.home}
                c="dark"
                fw={700}
                style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "var(--mantine-spacing-xs)" }}
              >
                <img src="/favicon.png" alt="" width={28} height={28} style={{ display: "block" }} />
                Tutoring App
              </Anchor>
              <Group gap="sm">
                <Anchor component={Link} href={routes.help} c="dimmed" size="sm">
                  Help
                </Anchor>
                <Anchor component={Link} href={routes.contact} c="dimmed" size="sm">
                  Contact
                </Anchor>
                {!isAuthenticated && (
                  <Anchor component={Link} href={routes.signIn} c="blue" size="sm" fw={600}>
                    Sign In
                  </Anchor>
                )}
              </Group>
            </Group>
          </Container>
        </Box>
        <Box className="app-stage">{children}</Box>
        {showFooter && <Footer />}
      </Box>
    );
  }

  return (
    <AppShell
      navbar={{
        width: sidebarCollapsed ? 86 : 270,
        breakpoint: "sm",
        collapsed: { desktop: false, mobile: !opened },
      }}
      header={{ height: 72 }}
      padding="lg"
    >
      <AppShell.Navbar p="md">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </AppShell.Navbar>

      <AppShell.Header className="app-topbar">
        <Container size="xl" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap="sm" wrap="nowrap">
              <Burger
                hiddenFrom="sm"
                opened={opened}
                onClick={toggleMobile}
                size="sm"
                aria-label="Toggle navigation"
              />
              <Anchor
                component={Link}
                href={routes.home}
                style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center" }}
              >
                <img src="/favicon.png" alt="" width={28} height={28} style={{ display: "block" }} />
              </Anchor>
              <Text fw={700}>{meta.title}</Text>
              {crumbs.length > 0 && (
                <Group gap={4} visibleFrom="md" c="dimmed">
                  <ChevronRight size={14} />
                  {crumbs.map((crumb, index) => (
                    <Group key={crumb.href} gap={4}>
                      <Anchor
                        component={Link}
                        href={crumb.href}
                        size="xs"
                        c={index === crumbs.length - 1 ? "dark" : "dimmed"}
                        fw={index === crumbs.length - 1 ? 600 : 400}
                      >
                        {crumb.label}
                      </Anchor>
                      {index < crumbs.length - 1 && <ChevronRight size={12} />}
                    </Group>
                  ))}
                </Group>
              )}
            </Group>
            <Group gap="sm">
              {!isAuthenticated ? (
                <Anchor component={Link} href={routes.signIn} c="blue" fw={600}>
                  <Group gap={6} wrap="nowrap">
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </Group>
                </Anchor>
              ) : (
                <ActionIcon radius="xl" variant="light" color="blue" size="lg">
                  <UserCircle2 size={18} />
                </ActionIcon>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main
        style={{
          paddingBottom: "92px",
        }}
        className="main-content app-page-enter"
      >
        <Container size="xl" px={0}>
          {children}
        </Container>
      </AppShell.Main>

      <Divider />
      <BottomNav />
    </AppShell>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <meta
          name="description"
          content="Tutoring platform for queue-based live learning and session feedback"
        />
      </head>
      <body>
        <MantineProvider theme={Theme} forceColorScheme="light">
          <Notifications position="top-right" />
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
