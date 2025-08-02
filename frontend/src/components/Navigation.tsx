"use client";

import {
  Group,
  Button,
  Text,
  NavLink,
  Avatar,
  Menu,
} from "@mantine/core";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, 
  ChevronDown, 
  Home, 
  LogIn, 
  Plus, 
  Search, 
  Settings, 
  User, 
  Users
} from "lucide-react";
import { Routes } from "../app/routes";

interface NavigationProps {
  routes: Routes;
}

// Define UserRole type
type UserRole = "student" | "instructor" | "admin";

// Mock auth state - in a real app, this would come from your auth provider
const isAuthenticated = true;
const userRole: UserRole = "student"; 
const userInfo = {
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://ui-avatars.com/api/?name=John+Doe",
};

function Logo() {
  return (
    <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
      <Group>
        <BookOpen size={24} />
        <Text fw={700} size="lg">LAUSD Tutoring</Text>
      </Group>
    </Link>
  );
}

function DesktopNav({ routes }: NavigationProps) {
  const pathname = usePathname();
  
  return (
    <Group gap="lg" visibleFrom="sm">
      <Link href={routes.home} style={{ textDecoration: "none", color: "inherit" }}>
        <Text fw={pathname === routes.home ? 700 : 400}>Home</Text>
      </Link>
      
      <Link href={routes.exploreSessions} style={{ textDecoration: "none", color: "inherit" }}>
        <Text fw={pathname.includes('/sessions/explore') ? 700 : 400}>Explore</Text>
      </Link>
      
      {isAuthenticated && userRole === "instructor" && (
        <Menu offset={0} position="bottom-end" withArrow>
          <Menu.Target>
            <Group style={{ cursor: "pointer" }} gap={4}>
              <Text fw={pathname.includes('/dashboard/instructor') ? 700 : 400}>Instructor</Text>
              <ChevronDown size={16} />
            </Group>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item component={Link} href={routes.instructorDashboard}>
              Dashboard
            </Menu.Item>
            <Menu.Item component={Link} href={routes.createSession}>
              Create New Session
            </Menu.Item>
            <Menu.Item component={Link} href={routes.profile}>
              My Profile
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
      
      <Link href={routes.help} style={{ textDecoration: "none", color: "inherit" }}>
        <Text fw={pathname === routes.help ? 700 : 400}>Help</Text>
      </Link>
    </Group>
  );
}

function MobileNav({ routes }: NavigationProps) {
  const pathname = usePathname();
  
  return (
    <>
      <NavLink
        label="Home"
        leftSection={<Home size={18} />}
        component={Link}
        href={routes.home}
        active={pathname === routes.home}
      />
      
      <NavLink
        label="Explore Sessions"
        leftSection={<Search size={18} />}
        component={Link}
        href={routes.exploreSessions}
        active={pathname.includes('/sessions/explore')}
      />
      
      {isAuthenticated && userRole === "instructor" && (
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
          href={routes.profile}
          active={pathname === routes.profile || pathname.includes('/profile')}
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
  return (
    <Group>
      {isAuthenticated ? (
        <Menu position="bottom-end" withArrow offset={4}>
          <Menu.Target>
            <Group style={{ cursor: "pointer" }} gap="xs">
              <Avatar src={userInfo.avatar} size="sm" radius="xl" />
              <Text fw={500} hiddenFrom="sm">
                {userInfo.name}
              </Text>
            </Group>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>
              Signed in as<br />
              <Text fw={500}>{userInfo.email}</Text>
            </Menu.Label>
            <Menu.Divider />
            {userRole === "student" && (
              <Menu.Item component={Link} href={routes.studentDashboard} leftSection={<Home size={14} />}>
                Student Dashboard
              </Menu.Item>
            )}
            {userRole === "instructor" && (
              <Menu.Item component={Link} href={routes.instructorDashboard} leftSection={<Home size={14} />}>
                Instructor Dashboard
              </Menu.Item>
            )}
            <Menu.Item component={Link} href={routes.profile} leftSection={<User size={14} />}>
              My Profile
            </Menu.Item>
            <Menu.Item component={Link} href={`${routes.profile}?tab=settings`} leftSection={<Settings size={14} />}>
              Account Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red">Sign Out</Menu.Item>
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