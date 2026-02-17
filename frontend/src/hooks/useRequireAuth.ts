"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

/**
 * Simple hook to protect pages that require authentication.
 * If user is not authenticated, redirects to login page.
 * 
 * Usage in any page component:
 * ```
 * const { user, isLoading } = useRequireAuth();
 * 
 * if (isLoading) return <LoadingSpinner />;
 * // user is guaranteed to exist here
 * ```
 */
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after loading is complete and user is not authenticated
    if (!isLoading && !user) {
      router.push("/auth/sign-in");
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}
