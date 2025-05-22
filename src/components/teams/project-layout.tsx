"use client";

import React from "react";
import { useTeamContext } from "@/contexts/team-context";
import FilterDropdown from "./filters-dropdown";
import { ProjectList } from "./projects/project-list";
import CreateProjectModal from "./create-project-modal";
import { useGetTeamProjects } from "@/queries/project-query";
import { useSearchParams } from "next/navigation";
import {
  type StatusOption,
  type SortField,
  type SortOrder,
  type DateRange,
} from "@/types/project-types";
import { FiInfo } from "react-icons/fi";
const EmptyTeamState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-4 py-24">
    <div className="bg-gray-100 p-6 rounded-full mb-4">
      <FiInfo size={35} />
    </div>
    <h3 className="text-xl font-semibold mb-2">No Team Selected</h3>
    <p className="text-gray-500 mb-6 max-w-md">
      Please select a team from the sidebar to view and manage projects for that
      team.
    </p>
  </div>
);

const LoadingProjects = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-green-800"></div>
  </div>
);

const EmptyProjects = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <p className="text-gray-500 mb-4">No projects found for this team.</p>
    <CreateProjectModal />
  </div>
);

const Functions = () => {
  const { activeTeam } = useTeamContext();
  const searchParams = useSearchParams();

  // Extract filter values from URL params
  const filters = {
    status: (searchParams.get("status") as StatusOption) || "all",
    sortField: (searchParams.get("sortField") as SortField) || "date",
    sortOrder: (searchParams.get("sortOrder") as SortOrder) || "desc",
    dateRange: (searchParams.get("dateRange") as DateRange) || "all",
    search: searchParams.get("search") || "",
  };
  // Fetch projects for the active team
  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useGetTeamProjects(activeTeam?.id || "", filters);

  if (!activeTeam) {
    return <EmptyTeamState />;
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        <p>
          Error loading projects: {error?.message || "Unknown error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-h-[calc(100vh-var(--header-height))] gap-4">
      <div className="flex w-full items-center justify-between">
        <span className="text-xl font-semibold">Projects</span>
        {projects && projects.length > 0 && <CreateProjectModal />}
      </div>

      <FilterDropdown />

      {isLoading ? (
        <LoadingProjects />
      ) : projects && projects.length > 0 ? (
        <ProjectList projects={projects} />
      ) : (
        <EmptyProjects />
      )}
    </div>
  );
};

export default Functions;
