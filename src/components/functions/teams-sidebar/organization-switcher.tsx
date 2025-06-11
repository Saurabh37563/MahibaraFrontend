"use client";

import React, { useRef, useEffect, useState } from "react";
import { useGetAllUserOrganizations } from "@/queries/organization-query";
import { Team } from "@/contexts/team-context";
import type { Organization } from "@/contexts/team-context";
import { ChevronsUpDown, MoreVertical } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";
import DeleteOrgModal from "../modals/delete-org-modal";
import { User } from "@/types/user-types";
import axios from "axios";
import { GoOrganization } from "react-icons/go";

interface OrganizationSwitcherProps {
  activeOrg: Organization | null;
  setActiveOrg: (org: Organization | null) => void;
  setActiveTeam: (team: Team | null) => void;
  setProjectName?: (name: string | null) => void;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  designation?: string;
  image?: string;
}

export function OrganizationSwitcher({
  activeOrg,
  setActiveOrg,
  setActiveTeam,
  setProjectName,
}: OrganizationSwitcherProps) {
  const {
    data: organizations = [],
    isLoading,
    refetch,
  } = useGetAllUserOrganizations(10);
  const { isMobile } = useSidebar();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [dropdownOpenOrg, setDropdownOpenOrg] = useState<number | null>(null);
  const [usersMap, setUsersMap] = useState<{ [key: number]: User }>({});

  const fetchAllUsers = async (): Promise<{ [key: number]: User }> => {
    try {
      const response = await axios.get(
        `http://192.168.1.63:8000/api/v1/teams/user-info`
      );

      const userData = response.data?.data || [];
      const userMap: { [key: number]: User } = {};

      userData.forEach((user: UserData) => {
        userMap[user.id] = {
          id: user.id,
          name: user.name,
          email: user.email,
          designation: user.designation || null,
          image: user.image || null,
          organizationId: null,
          organizationName: null,
          createdAt: null,
          updatedAt: null,
        };
      });

      return userMap;
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return {};
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (organizations.length > 0) {
        const userMap = await fetchAllUsers();
        setUsersMap(userMap);
      }
    };

    fetchUsers();
  }, [organizations]);

  const getOrgAdmin = (orgId: number): User | null => {
    const org = organizations.find((o) => o.id === orgId);
    if (org?.organisation_admin && usersMap[org.organisation_admin]) {
      return usersMap[org.organisation_admin];
    }
    return null;
  };

  const handleCreateSuccess = React.useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (!isLoading && organizations.length > 0) {
      if (activeOrg) {
        const orgStillExists = organizations.find(
          (org) => org.id === activeOrg.id
        );
        if (!orgStillExists) {
          console.log(
            "Active organization no longer exists, switching to first available org"
          );
          setActiveOrg(organizations[0]);
          setActiveTeam(null);
          if (setProjectName) setProjectName(null);
        }
      } else {
        setActiveOrg(organizations[0]);
        setActiveTeam(null);
        if (setProjectName) setProjectName(null);
      }
    } else if (!isLoading && organizations.length === 0 && activeOrg) {
      console.log("No organizations available, clearing active org");
      setActiveOrg(null);
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
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                ref={triggerRef}
                size="lg"
                className="w-full bg-slate-800/5 hover:bg-slate-800/10 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                {activeOrg ? (
                  <>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-emerald-800/20 text-green-900">
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
                  <div className="flex items-center gap-1 flex-1  text-left text-sm leading-tight">
                    <GoOrganization size={24} className="text-emerald-900" />
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
              className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-lg flex flex-col bg-gray-50 max-h-[70vh]"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <div className="text-xs text-muted-foreground px-2 py-1.5">
                Organizations
              </div>
              <div className="overflow-y-auto flex-1">
                {organizations.map((org) => (
                  <div key={org.id} className="relative group">
                    <DropdownMenuItem
                      onClick={() => {
                        setActiveOrg(org);
                        setActiveTeam(null);
                        if (setProjectName) setProjectName(null);
                      }}
                      className="gap-2 p-2 pr-10"
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={org?.image ?? "Test"}
                            alt={org.name}
                          />
                          <AvatarFallback className="">
                            {org.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="truncate max-w-[150px]">{org.name}</span>
                    </DropdownMenuItem>
                    <div
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu
                        modal={false}
                        open={dropdownOpenOrg === org.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setTimeout(() => setDropdownOpenOrg(null), 150);
                          }
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 p-0 rounded-md"
                            aria-label="Organization actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDropdownOpenOrg(
                                dropdownOpenOrg === org.id ? null : org.id
                              );
                            }}
                          >
                            <MoreVertical className="h-4 w-4 " />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                          onInteractOutside={(e) => {
                            const target = e.target as Element;
                            const isDialog =
                              target?.closest('[role="dialog"]') ||
                              target?.closest(
                                "[data-radix-popper-content-wrapper]"
                              ) ||
                              target?.closest(".radix-dialog-content");

                            if (e.type === "mousedown" && !isDialog) {
                              setDropdownOpenOrg(null);
                            } else {
                              e.preventDefault();
                            }
                          }}
                        >
                          <CreateOrganization
                            mode="edit"
                            organizationId={org.id}
                            defaultValues={{
                              name: org.name,
                              description: org.description || "",
                              organization_admin: getOrgAdmin(org.id),
                            }}
                            onCreateSuccess={() => {
                              setDropdownOpenOrg(null);
                              handleCreateSuccess();
                            }}
                          >
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <RiEdit2Line className="mr-2 h-4 w-4" />
                              Update
                            </DropdownMenuItem>
                          </CreateOrganization>
                          <DeleteOrgModal
                            orgId={org.id}
                            orgName={org.name}
                            onDeleted={() => {
                              setDropdownOpenOrg(null);
                              refetch();
                            }}
                          >
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <RiDeleteBinLine className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DeleteOrgModal>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t px-2 py-2 bg-background">
                <CreateOrganization onCreateSuccess={handleCreateSuccess} />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
