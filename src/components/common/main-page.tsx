'use client'

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push('/agents');
    } else if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);


  return <div className="min-h-screen flex items-center justify-center">
    {status === "loading" ? "Authenticating..." : "Redirecting..."}
  </div>;
}