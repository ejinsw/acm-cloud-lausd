"use client";

import {
  Stack,
  NavLink,
  Box,
  Divider,
  Group,
  Tooltip,
  ActionIcon,
  Text,
  Badge,
} from "@mantine/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  History,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CirclePlay,
} from "lucide-react";
import type { ComponentType } from "react";
import { useAuth } from "../AuthProvider";
import { routes } from "../../app/routes";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ size?: number }>;
  match: (pathname: string) => boolean;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const role = (user?.role || "STUDENT").toLowerCase();
  const dashboardRoute = routes.dashboard(role);

  const joinRoute =
    user?.role === "INSTRUCTOR"
      ? routes.instructorQueue
      : user?.role === "STUDENT"
        ? routes.joinQueue
        : routes.queue;

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: dashboardRoute,
      icon: Sparkles,
      match: (path) => path.startsWith("/dashboard"),
    },
    {
      label: "Queue",
      href: joinRoute,
      icon: CirclePlay,
      match: (path) => path.startsWith("/queue"),
    },
    {
      label: "History",
      href: routes.history,
      icon: History,
      match: (path) => path.startsWith("/history"),
    },
    {
      label: "Profile",
      href: routes.settings,
      icon: User,
      match: (path) => path.startsWith("/profile") || path.startsWith("/instructor"),
    },
  ];

  const renderToggle = () => {
    if (!onToggle) return null;
    return (
      <Group justify={collapsed ? "center" : "space-between"} mb="md" px={collapsed ? 0 : "xs"}>
        {!collapsed && (
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={700} style={{ color: "var(--app-muted)" }}>
              TUTORING APP
            </Text>
          </Box>
        )}
        <Tooltip
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          position="right"
          disabled={!collapsed}
          withArrow
        >
          <ActionIcon variant="subtle" color="dark" size="lg" onClick={onToggle}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </ActionIcon>
        </Tooltip>
      </Group>
    );
  };

  if (!isAuthenticated) {
    return (
      <Stack gap={0} h="100%" justify="space-between">
        <Box>
          {renderToggle()}
          <NavLink
            className="route-pill"
            label={collapsed ? undefined : "Sign In"}
            leftSection={<User size={18} />}
            component={Link}
            href={routes.signIn}
            style={{ color: "var(--app-muted)" }}
          />
        </Box>
      </Stack>
    );
  }

  return (
    <Stack gap={0} h="100%" justify="space-between">
      <Box>
        {renderToggle()}
        {!collapsed && (
          <Group justify="space-between" mb="sm" px="xs">
            <Text size="xs" tt="uppercase" fw={600} style={{ color: "var(--app-muted)" }}>
              Workspace
            </Text>
            <Badge size="xs" color="blue" variant="light">
              Live
            </Badge>
          </Group>
        )}
        <Stack gap={6}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Tooltip
                key={item.label}
                label={item.label}
                position="right"
                disabled={!collapsed}
                withArrow
              >
                <Box>
                  <NavLink
                    className={`route-pill ${active ? "active" : ""}`}
                    component={Link}
                    href={item.href}
                    label={collapsed ? undefined : item.label}
                    leftSection={<Icon size={18} />}
                    active={active}
                    style={{
                      justifyContent: collapsed ? "center" : "flex-start",
                      borderRadius: 12,
                      color: active ? "var(--app-blue)" : "var(--app-muted)",
                    }}
                  />
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      </Box>

      <Box>
        <Divider my="md" color="rgba(39, 116, 174, 0.14)" />
        <Stack gap={6}>
          <NavLink
            className={`route-pill ${pathname.startsWith("/profile") ? "active" : ""}`}
            label={collapsed ? undefined : "Settings"}
            leftSection={<Settings size={18} />}
            component={Link}
            href={routes.settings}
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 12,
              color: pathname.startsWith("/profile") || pathname.startsWith("/instructor")
                ? "var(--app-blue)"
                : "var(--app-muted)",
            }}
          />
          <NavLink
            className="route-pill"
            label={collapsed ? undefined : "Sign Out"}
            leftSection={<LogOut size={18} />}
            onClick={logout}
            c="red.6"
            style={{
              cursor: "pointer",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 12,
            }}
          />
        </Stack>
      </Box>
    </Stack>
  );
}
