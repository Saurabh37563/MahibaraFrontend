"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { QueryProvider } from "@/providers/query-provider";
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
    <QueryProvider>
      <div className="flex bg-slate-50 flex-col mx-auto w-dvw ">
        {shouldShowHeader && <Header />}
        <main className="">{children}</main>
      </div>
    </QueryProvider>
  );
}
