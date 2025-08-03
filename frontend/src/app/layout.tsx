"use client";

import { MantineProvider, AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Inter as FontSans } from "next/font/google";
import { Theme } from '../theme';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
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
  const [opened, { toggle }] = useDisclosure();

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
                header={{ height: 60 }}
                navbar={{ width: 300, breakpoint: 'sm', collapsed: { desktop: true, mobile: !opened } }}
                padding="md"
              >
                <AppShell.Header>
                  <Group h="100%" px="md" justify="space-between">
                    <Group>
                      <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                      <Navigation.Logo />
                    </Group>
                    <Navigation.DesktopNav routes={routes} />
                    <Navigation.Actions routes={routes} />
                  </Group>
                </AppShell.Header>

                <AppShell.Navbar p="md">
                  <Navigation.MobileNav routes={routes} />
                </AppShell.Navbar>

                <AppShell.Main>
                  {children}
                  <Footer />
                </AppShell.Main>
              </AppShell>
            </AuthProvider>
          </MantineProvider>
      </body>
    </html>
  );
}
