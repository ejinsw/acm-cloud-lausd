"use client";

import { Group, Button, Text, NavLink, Avatar, Menu } from "@mantine/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Home,
  LogIn,
  Plus,
  Search,
  Settings,
  User,
  Users,
  LogOut,
  MessageCircle,
  Clock,
} from "lucide-react";
import { Routes } from "../app/routes";
import { useAuth } from "./AuthProvider";

interface NavigationProps {
  routes: Routes;
}

function Logo() {
  return (
    <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
      <Group>
        <BookOpen size={24} />
        <Text fw={700} size="lg">
          LAUSD Tutoring
        </Text>
      </Group>
    </Link>
  );
}

function DesktopNav({ routes }: NavigationProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <Group gap="lg" visibleFrom="sm">
      <Link
        href={routes.home}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Text fw={pathname === routes.home ? 700 : 400}>Home</Text>
      </Link>

      {isAuthenticated && (
        <Link
          href={routes.exploreSessions}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Text fw={pathname.includes("/sessions/explore") ? 700 : 400}>
            Explore
          </Text>
        </Link>
      )}

      <Link
        href={routes.help}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <Text fw={pathname === routes.help ? 700 : 400}>Help</Text>
      </Link>
    </Group>
  );
}

function MobileNav({ routes }: NavigationProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <NavLink
        label="Home"
        leftSection={<Home size={18} />}
        component={Link}
        href={routes.home}
        active={pathname === routes.home}
      />

      {isAuthenticated && (
        <NavLink
          label="Explore Sessions"
          leftSection={<Search size={18} />}
          component={Link}
          href={routes.exploreSessions}
          active={pathname.includes("/sessions/explore")}
        />
      )}

      {isAuthenticated && user?.role === "STUDENT" && (
        <NavLink
          label="Join Queue"
          leftSection={<Clock size={18} />}
          component={Link}
          href={routes.joinQueue}
          active={pathname === routes.joinQueue}
        />
      )}

      {isAuthenticated && user?.role === "INSTRUCTOR" && (
        <NavLink
          label="Manage Queue"
          leftSection={<MessageCircle size={18} />}
          component={Link}
          href={routes.instructorQueue}
          active={pathname === routes.instructorQueue}
        />
      )}

      {isAuthenticated && user?.role === "INSTRUCTOR" && (
        <>
          <NavLink
            label="Instructor Dashboard"
            leftSection={<Users size={18} />}
            component={Link}
            href={routes.instructorDashboard}
            active={pathname === routes.instructorDashboard}
          />

          <NavLink
            label="Create Session"
            leftSection={<Plus size={18} />}
            component={Link}
            href={routes.createSession}
            active={pathname === routes.createSession}
          />
        </>
      )}

      <NavLink
        label="Help Center"
        leftSection={<Search size={18} />}
        component={Link}
        href={routes.help}
        active={pathname === routes.help}
      />

      {isAuthenticated ? (
        <NavLink
          label="Account Settings"
          leftSection={<Settings size={18} />}
          component={Link}
          href={routes.settings}
          active={pathname === routes.settings || pathname.includes("/profile")}
        />
      ) : (
        <NavLink
          label="Sign In"
          leftSection={<LogIn size={18} />}
          component={Link}
          href={routes.signIn}
          active={pathname === routes.signIn}
        />
      )}
    </>
  );
}

function Actions({ routes }: NavigationProps) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <Group>
      {isAuthenticated && user ? (
        <Menu position="bottom-end" withArrow offset={4}>
          <Menu.Target>
            <Group style={{ cursor: "pointer" }} gap="xs">
              <Avatar
                src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}`}
                size="sm"
                radius="xl"
              />
              <Text fw={500} hiddenFrom="sm">
                {user.firstName} {user.lastName}
              </Text>
            </Group>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>
              Signed in as
              <br />
              <Text fw={500}>{user.email}</Text>
            </Menu.Label>
            <Menu.Divider />
            {user.role === "STUDENT" && (
              <Menu.Item
                component={Link}
                href={routes.studentDashboard}
                leftSection={<Home size={14} />}
              >
                Student Dashboard
              </Menu.Item>
            )}
            {user.role === "INSTRUCTOR" && (
              <Menu.Item
                component={Link}
                href={routes.instructorDashboard}
                leftSection={<Home size={14} />}
              >
                Instructor Dashboard
              </Menu.Item>
            )}
            {user.role === "ADMIN" && (
              <Menu.Item
                component={Link}
                href={routes.adminDashboard}
                leftSection={<Home size={14} />}
              >
                Admin Dashboard
              </Menu.Item>
            )}

            {user.role === "INSTRUCTOR" && (
              <Menu.Item
                component={Link}
                href={routes.instructorProfile(user.id)}
                leftSection={<User size={14} />}
              >
                My Profile
              </Menu.Item>
            )}

            <Menu.Item
              component={Link}
              href={`${routes.settings}`}
              leftSection={<Settings size={14} />}
            >
              Account Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<LogOut size={14} />}
              onClick={logout}
            >
              Sign Out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : (
        <Group gap="xs" hiddenFrom="sm">
          <Button component={Link} href={routes.signIn} variant="subtle">
            Log In
          </Button>
          <Button component={Link} href={routes.signUp}>
            Sign Up
          </Button>
        </Group>
      )}
    </Group>
  );
}

const Navigation = {
  Logo,
  DesktopNav,
  MobileNav,
  Actions,
};

export default Navigation;
