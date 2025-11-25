"use client";

import { MantineProvider, AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Inter as FontSans } from "next/font/google";
import { Theme } from '../theme';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import { routes } from './routes';
import { Notifications } from "@mantine/notifications";
import { AuthProvider } from '../components/AuthProvider';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened] = useDisclosure(false);
  const [sidebarCollapsed, { toggle: toggleSidebar }] = useDisclosure(false); // Start expanded

  return (
    <html lang="en" className={fontSans.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="LAUSD Tutoring Platform - Connect with tutors for personalized learning"
        />
      </head>
      <body>
          <MantineProvider theme={Theme} forceColorScheme="light">
            <Notifications position="top-right" />
            <AuthProvider>
              <AppShell
                navbar={{ 
                  width: sidebarCollapsed ? 80 : 250, 
                  breakpoint: 'sm', 
                  collapsed: { desktop: false, mobile: !opened } 
                }}
                padding="md"
              >
                <AppShell.Navbar p="md" visibleFrom="sm">
                  <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
                </AppShell.Navbar>

                <AppShell.Navbar p="md" hiddenFrom="sm">
                  <Navigation.MobileNav routes={routes} />
                </AppShell.Navbar>

                <AppShell.Main
                  style={{
                    paddingBottom: "80px", // Space for bottom nav on mobile
                  }}
                  className="main-content"
                >
                  {children}
                  <Footer />
                </AppShell.Main>

                <BottomNav />
              </AppShell>
            </AuthProvider>
          </MantineProvider>
      </body>
    </html>
  );
}
