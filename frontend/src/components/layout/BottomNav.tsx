"use client";

import { Group, Box, Stack, Text, Button, Popover, ActionIcon } from "@mantine/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Clock, History, User, MoreVertical, Settings, LogOut, LogIn } from "lucide-react";
import { useAuth } from "../AuthProvider";
import { routes } from "../../app/routes";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "rgba(255,255,255,0.95)",
          borderTop: "1px solid rgba(39, 116, 174, 0.15)",
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
          backdropFilter: "blur(12px)",
        }}
        hiddenFrom="sm"
      >
        <Button component={Link} href={routes.signIn} leftSection={<LogIn size={16} />} fullWidth>
          Sign In
        </Button>
      </Box>
    );
  }

  const joinRoute =
    user?.role === "INSTRUCTOR"
      ? routes.instructorQueue
      : user?.role === "STUDENT"
        ? routes.joinQueue
        : routes.queue;

  const dashboardRoute = routes.dashboard((user?.role ?? "STUDENT").toLowerCase());
  const isActive = (route: string) => pathname === route || pathname.startsWith(route + "/");

  const navItems = [
    { label: "Dashboard", icon: Home, href: dashboardRoute, active: isActive(dashboardRoute) },
    { label: "Queue", icon: Clock, href: joinRoute, active: isActive(joinRoute) },
    { label: "History", icon: History, href: routes.history, active: isActive(routes.history) },
    {
      label: "Profile",
      icon: User,
      href: routes.settings,
      active: pathname.startsWith("/profile") || pathname.startsWith("/instructor"),
    },
  ];

  return (
    <>
      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.9))",
          borderTop: "1px solid rgba(39, 116, 174, 0.15)",
          padding: "8px 0 calc(8px + env(safe-area-inset-bottom))",
          backdropFilter: "blur(14px)",
        }}
        hiddenFrom="sm"
      >
        <Group grow px="xs" gap={0}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Stack
                  gap={3}
                  align="center"
                  style={{
                    padding: "8px 4px",
                    color: item.active ? "var(--app-blue)" : "var(--app-muted)",
                    opacity: item.active ? 1 : 0.86,
                    borderRadius: "999px",
                    width: "90%",
                    background: item.active
                      ? "linear-gradient(120deg, rgba(39, 116, 174, 0.14), rgba(255, 209, 0, 0.14))"
                      : "transparent",
                  }}
                >
                  <Icon size={20} />
                  <Text size="xs" fw={item.active ? 700 : 500}>
                    {item.label}
                  </Text>
                </Stack>
              </Link>
            );
          })}

          <Box style={{ width: "25%", display: "flex", justifyContent: "center" }}>
            <Popover position="top" withArrow shadow="md">
              <Popover.Target>
                <ActionIcon variant="subtle" radius="xl" size="xl" color="gray">
                  <Stack gap={3} align="center" style={{ padding: "8px 4px" }}>
                    <MoreVertical size={18} />
                    <Text size="xs" fw={500}>
                      More
                    </Text>
                  </Stack>
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown p="xs">
                <Stack gap="xs">
                  <Button
                    component={Link}
                    href={routes.settings}
                    variant="subtle"
                    leftSection={<Settings size={16} />}
                    fullWidth
                  >
                    Settings
                  </Button>
                  <Button
                    variant="subtle"
                    color="red"
                    leftSection={<LogOut size={16} />}
                    onClick={logout}
                    fullWidth
                  >
                    Sign Out
                  </Button>
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Box>
        </Group>
      </Box>
    </>
  );
}
