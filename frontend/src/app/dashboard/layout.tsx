"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useRequireAuth();

  // Show nothing while checking auth (redirect will happen if needed)
  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
