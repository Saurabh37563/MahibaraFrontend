"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import { QueryProvider } from "@/providers/query-provider";
import { SessionProvider } from "next-auth/react";
const HEADER_VISIBLE_ROUTES = [
  "/dashboard",
  "/agents",
  "/functions",
  "/help-and-support",
  "/profile",
];

export default function MainPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const shouldShowHeader = HEADER_VISIBLE_ROUTES.includes(pathname);

  return (
    <div className="flex flex-col mx-auto w-dvw ">
      {shouldShowHeader && <Header />}
      <main className="">
        <QueryProvider>{children}</QueryProvider>
      </main>
    </div>
  );
}
