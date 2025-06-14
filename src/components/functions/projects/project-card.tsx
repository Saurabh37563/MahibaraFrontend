"use client";
import { useState } from "react";
import { Project } from "@/types/project-types";
import { Clock, Folder, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ProjectStatusDialog } from "./project-status-dialog";
import { ProjectDeleteDialog } from "./project-delete-dialog";
import { useRouter } from "next/navigation";
import { useTeamContext } from "@/contexts/team-context";
import { LuTrash2 } from "react-icons/lu";
import { RiEdit2Line } from "react-icons/ri";

// Define project status types and config
type ProjectStatus = "completed" | "in-progress" | "pending" | "draft";

const statusConfig: Record<
  ProjectStatus,
  {
    color: string;
    iconColor: string;
    borderColor: string;
    bgColor: string;
    bgOpacityColor: string;
  }
> = {
  completed: {
    color: "text-emerald-900",
    iconColor: "text-emerald-900",
    borderColor: "border-emerald-900",
    bgColor: "bg-emerald-900",
    bgOpacityColor: "bg-emerald-900/10",
  },
  "in-progress": {
    color: "text-blue-900",
    iconColor: "text-blue-900",
    borderColor: "border-blue-900",
    bgColor: "bg-blue-900",
    bgOpacityColor: "bg-blue-900/10",
  },
  pending: {
    color: "text-[#b89921]",
    iconColor: "text-[#b89921]",
    borderColor: "border-[#b89921]",
    bgColor: "bg-[#b89921]",
    bgOpacityColor: "bg-[#b89921]/10",
  },
  draft: {
    color: "text-slate-500",
    iconColor: "text-slate-500",
    borderColor: "border-slate-300",
    bgColor: "bg-slate-500",
    bgOpacityColor: "bg-slate-500/10",
  },
};

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { activeOrg } = useTeamContext();
  const status = project.status as ProjectStatus;
  const {  iconColor, borderColor, bgColor } =
    statusConfig[status] || statusConfig["draft"];
  const router = useRouter();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Use correct field name from API: modified_date
  const modifiedDate = project.modified_date
    ? new Date(project.modified_date)
    : null;

  // Format date as "Jun 13, 2025"
  const formattedDate = modifiedDate
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(modifiedDate)
    : "";

  // Utility for "from now" (e.g., "2 days ago")
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (diffSec < 60) return rtf.format(-diffSec, "second");
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return rtf.format(-diffMin, "minute");
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return rtf.format(-diffHr, "hour");
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return rtf.format(-diffDay, "day");
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) return rtf.format(-diffMonth, "month");
    const diffYear = Math.floor(diffMonth / 12);
    return rtf.format(-diffYear, "year");
  };

  const fromNow = modifiedDate ? getRelativeTime(modifiedDate) : "";

  const handleCardClick = () => {
    const newParams = new URLSearchParams();
    newParams.set("orgName", activeOrg?.name || "Unknown Org");
    newParams.set("projectName", project.name);
    router.push(`/functions/${project.id}/?${newParams.toString()}`);
  };

  // Handles opening dialog after closing dropdown
  const handleOpenStatusDialog = () => {
    setDropdownOpen(false);
    setTimeout(() => setShowStatusDialog(true), 10);
  };
  const handleOpenDeleteDialog = () => {
    setDropdownOpen(false);
    setTimeout(() => setShowDeleteDialog(true), 10);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`group border ${borderColor} bg-white dark:bg-gray-800 rounded-xl  p-5 transition-all hover:shadow-md cursor-pointer hover:translate-y-[-2px] duration-300`}
        tabIndex={0}
        aria-label={`Open project ${project.name}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleCardClick();
          }
        }}
        role="button"
      >
        {/* Header with folder icon and status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Folder className={`h-6 w-6 stroke-2 ${iconColor} mr-2`} />
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full text-gray-500`}
            >
              {status
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
          <div className="project-dropdown">
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  aria-label="Project actions"
                  onClick={(e) => e.stopPropagation()} // Prevent card click when opening dropdown
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with dropdown
              >
                {project?.status !== "completed" && (
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOpenStatusDialog();
                    }}
                  >
                    <RiEdit2Line className="h-4 w-4 mr-2" />
                    Update Status
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenDeleteDialog();
                  }}
                >
                  <LuTrash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Project name and description */}
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 dark:group-hover:text-blue-400 transition-colors">
              {project.name}
            </h3>
          </div>
          {project.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 font-light">
              {project.description}
            </p>
          )}
        </div>

        {/* Status indicator bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-[6px] overflow-hidden">
          <div
            className={`h-[6px] rounded-full ${bgColor} w-full transform origin-left transition-transform duration-500 ease-out group-hover:scale-x-[1.03]`}
          ></div>
        </div>

        {/* Footer with date */}
        <div className="flex justify-between items-center mt-4 pt-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            <Clock className="h-4 w-4 mr-1.5" />
            <div className="flex flex-col text-xs items-start">
              <span className="font-medium">Modified {fromNow}</span>
              <span className="text-gray-400 dark:text-gray-500">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs rendered outside dropdown for correct behavior */}
      <ProjectStatusDialog
        project={project}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
      />

      <ProjectDeleteDialog
        project={project}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
};
