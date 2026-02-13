"use client";

import { useAuth } from "@/components/AuthProvider";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
        redirect("/auth/sign-in");
    }
  }, [user]);

  return <>{children}</>;
}
