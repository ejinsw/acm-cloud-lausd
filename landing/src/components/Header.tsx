"use client";

import { 
  Container, 
  Group, 
  Button, 
  Burger, 
  Drawer, 
  ScrollArea, 
  Divider,
  rem,
  Text,
  Box,
  Flex
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import { GraduationCap } from 'lucide-react';

const links = [
  { link: '#about', label: 'About' },
  { link: '#tutoring', label: 'Tutoring' },
  { link: '#subjects', label: 'Subjects' },
  { link: '#testimonials', label: 'Testimonials' },
  { link: '#contact', label: 'Contact' },
];

export function Header() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={`text-sm font-medium no-underline px-2 py-1 transition-colors 
      ${active === link.link ? 'text-blue-800' : 'text-gray-700 hover:text-blue-600'}`}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
        closeDrawer();
        // Smooth scroll to the section
        document.querySelector(link.link)?.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      {link.label}
    </a>
  ));

  return (
    <header className="sticky top-0 z-50 h-[70px] bg-white border-b border-gray-200">
      <Container size="xl" className="h-full">
        <Flex justify="space-between" align="center" className="h-full">
          <Group>
            <GraduationCap size={30} color="#1C3578" strokeWidth={2} />
            <Text fw={700} size="lg" c="#1C3578">LAUSD Tutoring</Text>
          </Group>

          {!isMobile && (
            <>
              <Group gap={5}>
                {items}
              </Group>

              <Group gap={10}>
                <Button color="blue">Get Started</Button>
              </Group>
            </>
          )}

          {isMobile && (
            <Burger opened={drawerOpened} onClick={toggleDrawer} />
          )}
        </Flex>

        {/* Mobile drawer */}
        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size="100%"
          padding="md"
          title="Navigation"
          zIndex={1000000}
        >
          <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
            <Divider my="sm" color="gray.1" />

            <Box className="flex flex-col gap-4 p-4">
              {items}
            </Box>

            <Divider my="sm" color="gray.1" />

            <Group justify="center" grow p="md">
              <Button color="blue">Get Started</Button>
            </Group>
          </ScrollArea>
        </Drawer>
      </Container>
    </header>
  );
} 