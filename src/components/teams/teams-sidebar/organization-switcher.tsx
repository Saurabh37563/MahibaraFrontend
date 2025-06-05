"use client";

import React, { useRef, useEffect } from "react";
import { useGetAllUserOrganizations } from "@/queries/organization-query"; // Import the hook
import { Team } from "@/contexts/team-context";
import type { Organization } from "@/contexts/team-context";
import { ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import CreateOrganization from "../create-organization";

interface OrganizationSwitcherProps {
  activeOrg: Organization | null;
  setActiveOrg: (org: Organization) => void;
  setActiveTeam: (team: Team | null) => void;
  setProjectName?: (name: string | null) => void; // <-- add this prop
}

export function OrganizationSwitcher({
  activeOrg,
  setActiveOrg,
  setActiveTeam,
  setProjectName, // <-- add this
}: OrganizationSwitcherProps) {
  const { data: organizations = [], isLoading } = useGetAllUserOrganizations(
    10 // TODO : Change this to the actual user ID
  );
  // Always call useSidebar unconditionally
  const { isMobile } = useSidebar();

  const triggerRef = useRef<HTMLButtonElement>(null);

  // Add this effect to set the first organization by default
  useEffect(() => {
    if (!isLoading && organizations.length > 0 && !activeOrg) {
      setActiveOrg(organizations[0]);
      setActiveTeam(null);
      if (setProjectName) setProjectName(null);
    }
  }, [
    organizations,
    isLoading,
    activeOrg,
    setActiveOrg,
    setActiveTeam,
    setProjectName,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 mt-1 h-10 px-3 rounded-md border border-input bg-background">
        <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                ref={triggerRef}
                size="lg"
                className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {activeOrg ? (
                  <>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg  ">
                      <Avatar className="size-8">
                        <AvatarFallback>
                          {activeOrg.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {activeOrg.name}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      Select Organization
                    </span>
                  </div>
                )}
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              style={{
                width: triggerRef.current?.clientWidth
                  ? `${triggerRef.current?.clientWidth}px`
                  : undefined,
              }}
              className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg flex flex-col max-h-[70vh]"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <div className="text-xs text-muted-foreground px-2 py-1.5">
                Organizations
              </div>

              {/* Scrollable org list */}
              <div className="overflow-y-auto flex-1">
                {organizations.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => {
                      setActiveOrg(org);
                      setActiveTeam(null);
                      if (setProjectName) setProjectName(null);
                    }}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={org?.image ?? "Test"}
                          alt={org.name}
                        />
                        <AvatarFallback>
                          {org.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="truncate max-w-[150px]">{org.name}</span>
                  </DropdownMenuItem>
                ))}
              </div>

              {/* Sticky footer */}
              <div className="border-t px-2 py-2 bg-background">
                <CreateOrganization />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
