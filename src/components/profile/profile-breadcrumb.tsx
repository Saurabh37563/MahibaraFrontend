"use client";
import { useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FiHome } from "react-icons/fi";

interface ProfileBreadcrumbProps {
  activeTab: string;
}

export const ProfileBreadcrumb = ({ activeTab }: ProfileBreadcrumbProps) => {
  useEffect(() => {
    const prevUrl = localStorage.getItem("previousUrl") || "/functions";

    return () => {
      if (window.location.pathname !== prevUrl) {
        localStorage.setItem("previousUrl", window.location.pathname);
      }
    };
  }, []);

  return (
    <div className="mb-4 flex">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="flex items-center gap-2"
              href="/functions"
            >
              <FiHome />
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {activeTab === "profile" ? "Profile" : "Security"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
