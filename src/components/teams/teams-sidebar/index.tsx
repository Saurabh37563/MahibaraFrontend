"use client";

import React from "react";
import {
  useTeamContext,
  type Organization,
  type Team,
} from "@/contexts/team-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrganizationSwitcher } from "./organization-switcher";
import CreateTeam from "../create-team";
import { useGetTeamsByOrganization } from "@/queries/teams-query";
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/avatargroup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function FunctionsSidebar() {
  const { activeOrg, setActiveOrg, activeTeam, setActiveTeam } =
    useTeamContext();

  const sidebarContext = useSidebar();
  const {
    isOpen = false,
    setOpen,
    setIsOpen = () => {},
    isMobile = false,
  }: any = sidebarContext || {};

  // Replace the teams part with:
  const { data: teams = [], isLoading: isLoadingTeams } =
    useGetTeamsByOrganization(activeOrg?.id ?? null);

  return (
    <>
      <Sidebar
        className={`h-[calc(100vh-var(--header-height))] sticky top-[var(--header-height)] ${
          isMobile ? "w-full max-w-[280px]" : "w-64"
        }`}
      >
        <SidebarContent className="">
          {isMobile && <SidebarTrigger className="p-4 self-end" />}
          <div className="px-4 py-2 space-y-4">
            <OrganizationSwitcher
              activeOrg={activeOrg}
              setActiveOrg={setActiveOrg}
              setActiveTeam={setActiveTeam}
            />

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-500">
                  Teams
                </label>
                {activeOrg && <CreateTeam />}
              </div>

              {isLoadingTeams ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse h-9 w-full bg-gray-200 rounded"
                    ></div>
                  ))}
                </div>
              ) : teams.length > 0 ? (
                <SidebarMenu>
                  {teams.map((team) => (
                    <SidebarMenuItem key={team.id}>
                      <Button
                        variant={
                          activeTeam?.id === team.id ? "default" : "ghost"
                        }
                        className={cn(
                          "w-full flex justify-between capitalize  text-left font-normal",
                          activeTeam?.id === team.id &&
                            "bg-green-400/20 text-green-950 hover:bg-green-400/30" // subtle accent background
                        )}
                        onClick={() => {
                          console.log("Selected team:", team);
                          setActiveTeam(team);
                          if (isMobile) {
                            setIsOpen(false);
                          }
                        }}
                      >
                        {team.name}
                        <AvatarGroup
                          className="text-[10px]"
                          max={2}
                          spacing={-1}
                          size="xs"
                        >
                          {team?.members?.map((member: any) => (
                            <Avatar>
                              <AvatarImage
                                src={member?.image || ""}
                                alt="User 1"
                              />
                              <AvatarFallback>
                                {member?.name?.split("")[0]}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </AvatarGroup>
                      </Button>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              ) : (
                <div className="text-sm text-gray-500 py-2">
                  {activeOrg ? "No teams available" : "Select an organization"}
                </div>
              )}
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
