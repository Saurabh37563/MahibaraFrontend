"use client";

import React from "react";
import { useTeamContext } from "@/contexts/team-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrganizationSwitcher } from "./organization-switcher";
import CreateTeam from "../create-team";
import {
  useGetTeamsByOrganization,
  useDeleteTeam,
} from "@/queries/teams-query";
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { TeamSchema } from "@/contexts/team-context";
import type { Organization } from "@/contexts/team-context";
import { EllipsisVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import DeleteTeamModal from "../modals/delete-team-modal";
import { toast } from "sonner";
import { RiEdit2Line } from "react-icons/ri";
import { HiUserGroup } from "react-icons/hi2";

interface SidebarContextType {
  setIsOpen?: (open: boolean) => void;
  isMobile?: boolean;
}

interface DeleteTeamError {
  message: string;
  code?: string;
  status?: number;
}

export default function FunctionsSidebar() {
  const { activeOrg, setActiveOrg, activeTeam, setActiveTeam, setProjectName } =
    useTeamContext();

  const sidebarContext = useSidebar();
  const setIsOpen =
    (sidebarContext as SidebarContextType)?.setIsOpen ?? (() => {});
  const isMobile = (sidebarContext as SidebarContextType)?.isMobile ?? false;

  const { data: rawTeams = [], isLoading: isLoadingTeams } =
    useGetTeamsByOrganization(activeOrg?.id ?? null);

  type TeamType = ReturnType<typeof TeamSchema.parse>;
  const teams = React.useMemo(
    () => rawTeams.map((team: unknown) => team as TeamType),
    [rawTeams]
  );

  const handleSetActiveOrg = (org: Organization | null) => {
    setActiveOrg(org);
    setActiveTeam(null);
    setProjectName(null);
  };

  const [selectedTeam, setSelectedTeam] = React.useState<TeamType | null>(null);
  const [hoveredTeamId, setHoveredTeamId] = React.useState<string | null>(null);
  const [openDropdownTeamId, setOpenDropdownTeamId] = React.useState<
    string | null
  >(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const deleteTeamMutation = useDeleteTeam();

  const mapTeamToFormValues = (team: TeamType) => ({
    id: team.id,
    name: team.name,
    description: team.description || "",
    members: (team.members || []).map((member) => ({
      id: member.id?.toString() || "",
      name: member.name || "",
      email: member.email || "",
      position: member.designation || "No designation",
      permission: "view" as const,
      avatarUrl: member.image || null,
      modulePermissions: member.modulePermissions || {
        projects: "view" as const,
        analytics: "view" as const,
        file_processing: "no_access" as const,
      },
    })),
  });

  const handleEditTeam = (team: TeamType) => {
    setSelectedTeam(team);
    setEditModalOpen(true);
    setOpenDropdownTeamId(null);
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    try {
      const result = await deleteTeamMutation.mutateAsync(
        Number(selectedTeam.id)
      );
      if (result.success) {
        toast.success(result.message);
        if (activeTeam?.id === selectedTeam.id) {
          setActiveTeam(null);
          setProjectName(null);
        }
      }
      setDeleteModalOpen(false);
      setSelectedTeam(null);
    } catch (error: unknown) {
      const teamError = error as DeleteTeamError;
      toast.error(teamError.message || "Failed to delete team");
    }
  };

  const handleCreateTeamClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!activeOrg) {
      e.preventDefault();
      toast.error("Please select an organization first.");
      return;
    }
  };

  return (
    <>
      <Sidebar
        className={` h-[calc(100vh-var(--header-height))] !border-0 sticky top-[var(--header-height)] ${
          isMobile ? "w-max max-w-[400px]" : "w-64"
        }`}
      >
        <SidebarContent className="bg-white border-2 border-emerald-800/10 rounded-sm py-2">
          {isMobile && <SidebarTrigger className="p-4 self-end" />}
          <div className=" flex flex-col items-center w-full h-full py-2 space-y-4">
            <div className="flex flex-col gap-2 sticky z-10 top-0 w-full">
              <OrganizationSwitcher
                activeOrg={activeOrg}
                setActiveOrg={handleSetActiveOrg}
                setActiveTeam={setActiveTeam}
                setProjectName={setProjectName}
              />
              <Separator />
              <div className="flex px-4 items-center justify-between mb-2 ">
                <div className="flex items-center gap-2">
                  <HiUserGroup
                    size={20}
                    className="text-emerald-900 align-left"
                  />
                  <label className="text-sm font-semibold text-gray-500">
                    Functions
                  </label>
                </div>
                <CreateTeam
                  open={undefined}
                  onOpenChange={undefined}
                  mode={undefined}
                  initialValues={undefined}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Create Team"
                    tabIndex={0}
                    onClick={handleCreateTeamClick}
                  >
                    <span className="sr-only">Create Team</span>+
                  </Button>
                </CreateTeam>
              </div>
            </div>

            <div className="px-3 h-full w-full flex-1">
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
                    <SidebarMenuItem key={team.id} className="w-full  p-0">
                      <div
                        className="flex items-center w-full gap-1"
                        onMouseEnter={() => setHoveredTeamId(team.id)}
                        onMouseLeave={() => setHoveredTeamId(null)}
                      >
                        <Button
                          variant={
                            activeTeam?.id === team.id ? "default" : "ghost"
                          }
                          className={cn(
                            "flex-1 flex items-center justify-between capitalize text-left font-normal pr-2 group",
                            activeTeam?.id === team.id &&
                              "bg-emerald-800/10 text-green-950 hover:bg-emerald-800/20"
                          )}
                          onClick={() => {
                            setActiveTeam(team);
                            setProjectName(team.name);
                            if (isMobile) {
                              setIsOpen(false);
                            }
                          }}
                          aria-label={`Select team ${team.name}`}
                        >
                          <span className="truncate">{team.name}</span>
                          <div className="flex items-center gap-1">
                            <DropdownMenu
                              modal={false}
                              open={openDropdownTeamId === team.id}
                              onOpenChange={(open) => {
                                setOpenDropdownTeamId(open ? team.id : null);
                              }}
                            >
                              <DropdownMenuTrigger asChild>
                                <div
                                  className={cn(
                                    "flex h-8 w-8 p-0 justify-center items-center hover:bg-gray-200/80 rounded-lg transition-opacity duration-200",
                                    hoveredTeamId === team.id ||
                                      openDropdownTeamId === team.id
                                      ? "opacity-100"
                                      : "opacity-0 pointer-events-none"
                                  )}
                                  aria-label={`Open actions for team ${team.name}`}
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }}
                                >
                                  <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleEditTeam(team);
                                  }}
                                  className="cursor-pointer flex items-center gap-2"
                                >
                                  <RiEdit2Line className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    setSelectedTeam(team);
                                    setDeleteModalOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </Button>
                      </div>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              ) : (
                <div className="flex h-full  flex-col text-gray-600 items-center justify-center py-8 gap-3 text-center">
                  {activeOrg ? (
                    <>
                      <div className="font-semibold  text-base">
                        No teams yet
                      </div>
                      <div className="text-sm  max-w-xs">
                        You haven&apos;t created any teams for this
                        organization. Teams help you organize members and
                        projects efficiently.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold  text-base">
                        No organization selected
                      </div>
                      <div className="text-sm  max-w-xs">
                        Please select an organization to view its teams, or
                        create a new organization to get started.
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </SidebarContent>
      </Sidebar>

      {selectedTeam && (
        <CreateTeam
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) {
              setSelectedTeam(null);
            }
          }}
          mode="update"
          initialValues={mapTeamToFormValues(selectedTeam)}
        />
      )}

      <DeleteTeamModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open);
          if (!open) setSelectedTeam(null);
        }}
        onDelete={handleDeleteTeam}
        isPending={deleteTeamMutation.isPending}
        teamName={selectedTeam?.name}
      />
    </>
  );
}
