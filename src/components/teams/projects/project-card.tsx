import { useState } from "react";
import moment from "moment";
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
    color: "text-emerald-700",
    iconColor: "text-emerald-700",
    borderColor: "border-emerald-700",
    bgColor: "bg-emerald-700",
    bgOpacityColor: "bg-emerald-700/10",
  },
  "in-progress": {
    color: "text-blue-600",
    iconColor: "text-blue-600",
    borderColor: "border-blue-600",
    bgColor: "bg-blue-600",
    bgOpacityColor: "bg-blue-600/10",
  },
  pending: {
    color: "text-amber-600",
    iconColor: "text-amber-600",
    borderColor: "border-amber-600",
    bgColor: "bg-amber-600",
    bgOpacityColor: "bg-amber-600/10",
  },
  draft: {
    color: "text-slate-500",
    iconColor: "text-slate-500",
    borderColor: "border-slate-500",
    bgColor: "bg-slate-500",
    bgOpacityColor: "bg-slate-500/10",
  },
};

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const status = project.status as ProjectStatus;
  const { color, iconColor, borderColor, bgColor } =
    statusConfig[status] || statusConfig["draft"];
  const router = useRouter();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formattedDate = moment(project.modifiedDate).format("MMM D, YYYY");
  const fromNow = moment(project.modifiedDate).fromNow();

  const handleCardClick = () => {
    router.push(`/functions/${project.id}`);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`group border ${borderColor} bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 transition-all hover:shadow-md cursor-pointer hover:translate-y-[-2px] duration-300`}
      >
        {/* Header with folder icon and status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <Folder className={`h-6 w-6 stroke-1 ${iconColor} mr-2`} />
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}
            >
              {status
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
          </div>
          <div className="project-dropdown">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {project?.status !== "completed" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStatusDialog(true);
                    }}
                  >
                    Update Status
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
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
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full ${bgColor} w-full transform origin-left transition-transform duration-500 ease-out group-hover:scale-x-[1.03]`}
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
