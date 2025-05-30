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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
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
}

export function OrganizationSwitcher({
  activeOrg,
  setActiveOrg,
  setActiveTeam,
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
    }
  }, [organizations, isLoading, activeOrg, setActiveOrg]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 mt-1 h-10 px-3 rounded-md border border-input bg-background">
        <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 ">
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
              className="min-w-[200px] rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((org, index) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => {
                    setActiveOrg(org);
                    setActiveTeam(null); // Reset team
                  }}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={org?.image ?? "Test"} alt={org.name} />
                      <AvatarFallback>
                        {org.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {org.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5">
                <CreateOrganization />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
