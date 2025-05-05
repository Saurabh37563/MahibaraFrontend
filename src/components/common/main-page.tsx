'use client'

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      // User is logged in, redirect to dashboard
      router.push('/dashboard');
    } else if (status === "unauthenticated") {
      // User is not logged in, redirect to login
      router.push('/login');
    }
    // Don't redirect while loading - wait for the status to be determined
  }, [status, router]);

  // Optional: Return nothing or a minimal loading indicator
  return <div className="min-h-screen flex items-center justify-center">
    {status === "loading" ? "Authenticating..." : "Redirecting..."}
  </div>;
}