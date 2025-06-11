"use client";

import React, { useState, useCallback } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";

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
  const [currentPage, setCurrentPage] = useState(1);

  const filters = {
    status: (searchParams.get("status") as StatusOption) || "all",
    sortField: (searchParams.get("sortField") as SortField) || "date",
    sortOrder: (searchParams.get("sortOrder") as SortOrder) || "desc",
    dateRange: (searchParams.get("dateRange") as DateRange) || "all",
    search: searchParams.get("search") || "",
    page: currentPage,
  };

  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useGetTeamProjects(activeTeam?.id || "", filters);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const getPageNumbers = () => {
    const totalPages = projects?.metadata?.total_pages || 1;
    const currentPageNum = projects?.metadata?.current_page || 1;
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPageNum <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPageNum >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPageNum - 1,
          currentPageNum,
          currentPageNum + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  if (!activeTeam) return <EmptyTeamState />;
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
        {projects && projects.data && projects.data.length > 0 && (
          <CreateProjectModal />
        )}
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-0 z-10  ">
        <FilterDropdown />
      </div>

      {/* Scrollable Project List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isLoading ? (
          <LoadingProjects />
        ) : projects?.data && projects?.data.length > 0 ? (
          <ProjectList projects={projects.data} />
        ) : (
          <EmptyProjects />
        )}
      </div>

      {/* Sticky Pagination */}
      {projects?.data && projects?.data.length > 0 && (
        <div className="sticky bottom-0 z-10  ">
          <div className="flex justify-center mt-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(
                        Math.max(1, projects.metadata.current_page - 1)
                      )
                    }
                    aria-disabled={projects.metadata.current_page === 1}
                    className={
                      projects.metadata.current_page === 1
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
                {getPageNumbers().map((page, idx) =>
                  page === "..." ? (
                    <PaginationItem key={idx}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === projects.metadata.current_page}
                        onClick={() =>
                          typeof page === "number" && handlePageChange(page)
                        }
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(
                        Math.min(
                          projects.metadata.total_pages,
                          projects.metadata.current_page + 1
                        )
                      )
                    }
                    aria-disabled={
                      projects.metadata.current_page ===
                      projects.metadata.total_pages
                    }
                    className={
                      projects.metadata.current_page ===
                      projects.metadata.total_pages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  );
};

export default Functions;
