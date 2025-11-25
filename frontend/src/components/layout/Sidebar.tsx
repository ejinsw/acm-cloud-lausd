"use client";

import { Stack, NavLink, Box, Divider, Group, Tooltip, ActionIcon, Text } from "@mantine/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { History, User, Settings, LogOut, ChevronLeft, ChevronRight, Play, LogIn } from "lucide-react";
import { useAuth } from "../AuthProvider";
import { routes } from "../../app/routes";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const role = (user?.role || "STUDENT").toLowerCase();
  const dashboardRoute = routes.dashboard(role);

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

  const handleLogout = async () => {
    await logout();
  };

  if (!isAuthenticated) {
    return (
      <Stack gap={0} h="100%" justify="space-between" style={{ position: "relative" }}>
        <Box>
          {onToggle && (
            <Group justify={collapsed ? "center" : "space-between"} mb="lg" px={collapsed ? 0 : "xs"}>
              {!collapsed && (
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={600} c="dimmed">
                    Menu
                  </Text>
                </Box>
              )}
              <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} position="right">
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  onClick={onToggle}
                  style={{
                    width: collapsed ? "100%" : "auto",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </ActionIcon>
              </Tooltip>
            </Group>
          )}

          <NavLink
            label={collapsed ? undefined : "Sign In"}
            leftSection={<LogIn size={20} />}
            component={Link}
            href={routes.signIn}
            variant="subtle"
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: "8px",
              padding: collapsed ? "12px" : "12px 16px",
              transition: "all 0.2s ease",
            }}
          />
        </Box>
      </Stack>
    );
  }

  return (
    <Stack gap={0} h="100%" justify="space-between" style={{ position: "relative" }}>
      {/* Top section - Main navigation */}
      <Box>
        {/* Toggle Button */}
        {onToggle && (
          <Group justify={collapsed ? "center" : "space-between"} mb="lg" px={collapsed ? 0 : "xs"}>
            {!collapsed && (
              <Box style={{ flex: 1 }}>
                <Text size="sm" fw={600} c="dimmed">
                  Menu
                </Text>
              </Box>
            )}
            <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} position="right">
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={onToggle}
                style={{
                  width: collapsed ? "100%" : "auto",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
        
        <Stack gap={4}>
          <Tooltip label="Join" position="right" disabled={!collapsed} withArrow>
            <Box>
              <NavLink
                label={collapsed ? undefined : "Join"}
                leftSection={<Play size={20} />}
                component={Link}
                href={joinRoute}
                active={isActive(joinRoute)}
                variant="subtle"
                style={{
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: "8px",
                  padding: collapsed ? "12px" : "12px 16px",
                  transition: "all 0.2s ease",
                }}
              />
            </Box>
          </Tooltip>
          <Tooltip label="History" position="right" disabled={!collapsed} withArrow>
            <Box>
              <NavLink
                label={collapsed ? undefined : "History"}
                leftSection={<History size={20} />}
                component={Link}
                href={historyRoute}
                active={isActive(historyRoute)}
                variant="subtle"
                style={{
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: "8px",
                  padding: collapsed ? "12px" : "12px 16px",
                  transition: "all 0.2s ease",
                }}
              />
            </Box>
          </Tooltip>
          <Tooltip label="Profile" position="right" disabled={!collapsed} withArrow>
            <Box>
              <NavLink
                label={collapsed ? undefined : "Profile"}
                leftSection={<User size={20} />}
                component={Link}
                href={dashboardRoute}
                active={pathname === routes.settings || pathname.includes("/dashboard")}
                variant="subtle"
                style={{
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: "8px",
                  padding: collapsed ? "12px" : "12px 16px",
                  transition: "all 0.2s ease",
                }}
              />
            </Box>
          </Tooltip>
        </Stack>
      </Box>

      {/* Bottom section - Settings and Sign Out */}
      <Box>
        <Divider mb="md" />
        <Stack gap={4}>
          <Tooltip label="Settings" position="right" disabled={!collapsed} withArrow>
            <Box>
              <NavLink
                label={collapsed ? undefined : "Settings"}
                leftSection={<Settings size={20} />}
                component={Link}
                href={routes.settings}
                active={pathname === routes.settings || pathname.includes("/profile")}
                variant="subtle"
                style={{
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: "8px",
                  padding: collapsed ? "12px" : "12px 16px",
                  transition: "all 0.2s ease",
                }}
              />
            </Box>
          </Tooltip>
          <Tooltip label="Sign Out" position="right" disabled={!collapsed} withArrow>
            <Box>
              <NavLink
                label={collapsed ? undefined : "Sign Out"}
                leftSection={<LogOut size={20} />}
                onClick={handleLogout}
                variant="subtle"
                style={{
                  cursor: "pointer",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderRadius: "8px",
                  padding: collapsed ? "12px" : "12px 16px",
                  transition: "all 0.2s ease",
                }}
              />
            </Box>
          </Tooltip>
        </Stack>
      </Box>
    </Stack>
  );
}

