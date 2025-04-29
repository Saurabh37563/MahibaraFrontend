"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import { QueryProvider } from "@/providers/QueryProvider";

const HEADER_VISIBLE_ROUTES = ["/dashboard", "/agents", "/functions"];

export default function MainPageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const shouldShowHeader = HEADER_VISIBLE_ROUTES.includes(pathname);

  return (
    <div className="flex flex-col mx-auto">
      {shouldShowHeader && <Header />}
      <main>
        <QueryProvider>
          {children}
        </QueryProvider>
      </main>
    </div>
  );
}
