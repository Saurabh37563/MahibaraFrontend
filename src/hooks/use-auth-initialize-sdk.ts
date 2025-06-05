// hooks/useAuthSDK.ts
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { initializeSDK, getSDK } from "@/lib/auth-sdk";

export function useAuthSDK() {
  const { data: session, status } = useSession();
  const initializedRef = useRef(false);
  const [sdk, setSdk] = useState<ReturnType<typeof getSDK> | null>(null);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.accessToken &&
      !initializedRef.current
    ) {
      initializeSDK(session.accessToken, "322159618136473606");
      initializedRef.current = true;
      setSdk(getSDK());
    }
  }, [status, session]);

  return {
    sdk,
    isReady: Boolean(sdk),
    isLoading: status === "loading" || !sdk,
  };
}
