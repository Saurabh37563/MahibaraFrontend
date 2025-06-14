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

  // State to track which team is being hovered
  const [hoveredTeamId, setHoveredTeamId] = React.useState<string | null>(null);
  // State to track which dropdown is open
  const [openDropdownTeamId, setOpenDropdownTeamId] = React.useState<
    string | null
  >(null);

  // State for edit modal
  const [editModalOpen, setEditModalOpen] = React.useState(false);

  // State for delete modal
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const deleteTeamMutation = useDeleteTeam();

  // Helper to map team to CreateTeamFormValues
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
    setOpenDropdownTeamId(null); // Close the dropdown
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;

    try {
      const result = await deleteTeamMutation.mutateAsync(
        Number(selectedTeam.id)
      );

      if (result.success) {
        toast.success(result.message);

        // If the deleted team was the active team, clear it
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
      console.error("Delete team error:", teamError);
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
          <div className=" py-2 space-y-4">
            <OrganizationSwitcher
              activeOrg={activeOrg}
              setActiveOrg={handleSetActiveOrg}
              setActiveTeam={setActiveTeam}
              setProjectName={setProjectName}
            />

            <Separator />
            <div className="px-3">
              <div className="flex items-center justify-between mb-2 ">
                <div className="flex items-center gap-2">
                  <HiUserGroup
                    size={20}
                    className="text-emerald-900 align-left"
                  />
                  <label className="text-sm font-medium text-gray-500">
                    Functions
                  </label>
                </div>
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
                    <SidebarMenuItem key={team.id} className="w-full p-0">
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
                <div className="text-sm text-gray-500 py-2">
                  {activeOrg ? "No teams available" : "Select an organization"}
                </div>
              )}
            </div>
          </div>
        </SidebarContent>
      </Sidebar>

      {/* Edit Team Modal */}
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
