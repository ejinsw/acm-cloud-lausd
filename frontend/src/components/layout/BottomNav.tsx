"use client";

import { Group, Box, Stack, Text, Button, Popover, ActionIcon } from "@mantine/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Clock, History, User, MoreVertical, Settings, LogOut, LogIn } from "lucide-react";
import { useAuth } from "../AuthProvider";
import { routes } from "../../app/routes";

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated) {
    return (
      <Box
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "var(--mantine-color-body)",
          borderTop: "1px solid var(--mantine-color-gray-3)",
          padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
          boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
        }}
        hiddenFrom="sm"
      >
        <Button
          component={Link}
          href={routes.signIn}
          leftSection={<LogIn size={16} />}
          fullWidth
        >
          Sign In
        </Button>
      </Box>
    );
  }

  // Determine Join route based on user role
  const getJoinRoute = () => {
    if (user?.role === "STUDENT") {
      return routes.joinQueue;
    } else if (user?.role === "INSTRUCTOR") {
      return routes.instructorQueue;
    }
    return routes.queue;
  };

  const joinRoute = getJoinRoute();
  const historyRoute = routes.history;

  // Check if current path matches the route (including query params for history)
  const isActive = (route: string) => {
    if (route.includes("?")) {
      const baseRoute = route.split("?")[0];
      return pathname.startsWith(baseRoute);
    }
    return pathname === route;
  };

  const navItems = [
    {
      label: "Join",
      icon: Clock,
      href: joinRoute,
      active: isActive(joinRoute),
    },
    {
      label: "History",
      icon: History,
      href: historyRoute,
      active: isActive(historyRoute),
    },
    {
      label: "Profile",
      icon: User,
      href: routes.settings,
      active: pathname === routes.settings || pathname.includes("/profile"),
    },
  ];

  return (
    <Box
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: "var(--mantine-color-body)",
        borderTop: "1px solid var(--mantine-color-gray-3)",
        padding: "8px 0 calc(8px + env(safe-area-inset-bottom))",
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
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
                gap={4}
                align="center"
                style={{
                  padding: "8px 4px",
                  opacity: item.active ? 1 : 0.6,
                  color: item.active
                    ? "var(--mantine-color-blue-6)"
                    : "var(--mantine-color-gray-7)",
                }}
              >
                <Icon size={22} />
                <Text size="xs" fw={item.active ? 600 : 400}>
                  {item.label}
                </Text>
              </Stack>
            </Link>
          );
        })}

        <Box style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Popover position="top" withArrow shadow="md">
            <Popover.Target>
              <Box
                component="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <Stack
                  gap={4}
                  align="center"
                  style={{
                    padding: "8px 4px",
                    color: "var(--mantine-color-gray-7)",
                  }}
                >
                  <ActionIcon
                    variant="subtle"
                    radius="xl"
                    size="lg"
                    color="gray"
                  >
                    <MoreVertical size={20} />
                  </ActionIcon>
                  <Text size="xs" fw={500}>
                    More
                  </Text>
                </Stack>
              </Box>
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
                  onClick={handleLogout}
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
  );
}

