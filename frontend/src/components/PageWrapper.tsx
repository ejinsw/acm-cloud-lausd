"use client";

import { Suspense } from "react";
import { Center, Loader } from "@mantine/core";

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <Suspense
      fallback={
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      }
    >
      {children}
    </Suspense>
  );
} 