import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/styles/resizable-handle.css";
import MainPageLayout from "@/components/layout/root-layout";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "next-auth/react";
import { TeamContextProvider } from "@/contexts/team-context";
import { SidebarProvider } from "@/components/ui/sidebar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "M&AI",
  description:
    "A powerful platform for intelligent procurement audits, compliance, and data-driven insights.",
  icons: {
    icon: "/mab.svg", 
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head />
      <body className="font-sans antialiased ">
        <SessionProvider>
          <AuthProvider>
            <Toaster />
            <SidebarProvider>
              <TeamContextProvider>
                <MainPageLayout>{children}</MainPageLayout>
              </TeamContextProvider>
            </SidebarProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
