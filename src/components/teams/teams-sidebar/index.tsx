"use client";

import React from "react";
import { useTeamContext } from "@/contexts/team-context";
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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AvatarGroup } from "@/components/ui/avatargroup";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamSchema } from "@/contexts/team-context";
import type { Organization } from "@/contexts/team-context";

export default function FunctionsSidebar() {
  const { activeOrg, setActiveOrg, activeTeam, setActiveTeam, setProjectName } =
    useTeamContext();

  const sidebarContext = useSidebar();
  // Use type assertion to allow setIsOpen if it exists, otherwise fallback
  const setIsOpen =
    (sidebarContext as { setIsOpen?: (open: boolean) => void })?.setIsOpen ??
    (() => {});
  const isMobile =
    (sidebarContext as { isMobile?: boolean })?.isMobile ?? false;

  // Replace the teams part with:
  const { data: rawTeams = [], isLoading: isLoadingTeams } =
    useGetTeamsByOrganization(activeOrg?.id ?? null);

  // Use the correct type for teams
  type TeamType = ReturnType<typeof TeamSchema.parse>;
  const teams = React.useMemo(
    // () => rawTeams.map((team: unknown) => TeamSchema.parse(team)),
    () => rawTeams.map((team: unknown) => team as TeamType),
    [rawTeams]
  );

  // Helper to wrap setActiveOrg to accept Organization (id as string)
  const handleSetActiveOrg = (org: Organization) => {
    setActiveOrg(org);
    setActiveTeam(null);
    setProjectName(null);
  };

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
              setActiveOrg={handleSetActiveOrg}
              setActiveTeam={setActiveTeam}
              setProjectName={setProjectName}
            />

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-500">
                  Functions
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
                  {teams.map((team: TeamType) => (
                    <SidebarMenuItem key={team.name}>
                      <Button
                        variant={
                          activeTeam?.id === team.id ? "default" : "ghost"
                        }
                        className={cn(
                          "w-full flex justify-between capitalize text-left font-normal",
                          activeTeam?.id === team.id &&
                            "bg-green-400/20 text-green-950 hover:bg-green-400/30"
                        )}
                        onClick={() => {
                          setActiveTeam(team);
                          setProjectName(team.name); // Use team name as project name
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
                          {team?.members?.map(
                            (
                              member: {
                                id: string | number;
                                email?: string;
                                name?: string;
                                image?: string;
                                // other possible fields...
                              },
                              idx: number
                            ) => (
                              <Avatar
                                key={String(member?.id) || member?.email || idx}
                              >
                                <AvatarImage
                                  src={member?.image || ""}
                                  alt="User 1"
                                />
                                <AvatarFallback>
                                  {member?.name?.split("")[0]}
                                </AvatarFallback>
                              </Avatar>
                            )
                          )}
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
