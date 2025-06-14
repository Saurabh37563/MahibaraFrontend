"use client";

import React, { useRef, useEffect } from "react";
import { useTeamContext } from "@/contexts/team-context";
import FilterDropdown from "./filters-dropdown";
import { ProjectList } from "./projects/project-list";
import CreateProjectModal from "./create-project-modal";
import { useGetTeamProjectsInfinite } from "@/queries/project-query";
import { useSearchParams } from "next/navigation";
import {
  type StatusOption,
  type SortField,
  type SortOrder,
  type DateRange,
  type Project,
} from "@/types/project-types";
import { MdGroupOff } from "react-icons/md";
import { Loader2 } from "lucide-react";

type PaginatedProjectsResponse = {
  data: Project[];
};

const EmptyTeamState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6 py-32">
    <div className="text-emerald-800 bg-emerald-800/10 p-6 rounded-full mb-6 shadow-sm">
      <MdGroupOff size={40} />
    </div>
    <h3 className="text-2xl font-semibold mb-2 text-gray-800">
      No Team Selected
    </h3>
    <p className="text-gray-500 text-base max-w-md">
      Choose a team from the sidebar to view and manage projects for that team.
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

  const filters = {
    status: (searchParams.get("status") as StatusOption) || "all",
    sortField: (searchParams.get("sortField") as SortField) || "date",
    sortOrder: (searchParams.get("sortOrder") as SortOrder) || "desc",
    dateRange: (searchParams.get("dateRange") as DateRange) || "all",
    search: searchParams.get("search") || "",
  };

  // Infinite Query
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTeamProjectsInfinite(activeTeam?.id || "", filters);

  // Flatten all projects from pages
  const allProjects: Project[] =
    data?.pages.flatMap(
      (page: PaginatedProjectsResponse) => page?.data ?? []
    ) ?? [];

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );
    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, fetchNextPage, isLoading]);

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
    <div className="flex flex-col h-full w-full bg-white/30  p-4 rounded-sm border-2 border-emerald-800/10 max-h-[calc(100vh-var(--header-height))] gap-1">
      <div className="w-full flex flex-col gap-3   ">
        <div className="flex w-full items-center justify-between ">
          <span className="text-xl font-semibold">Projects</span>
          {allProjects.length > 0 && <CreateProjectModal />}
        </div>
        <FilterDropdown />
      </div>

      <div className="flex-1 rounded-xl min-h-0 overflow-y-auto">
        {isLoading ? (
          <LoadingProjects />
        ) : allProjects.length > 0 ? (
          <ProjectList projects={allProjects} />
        ) : (
          <EmptyProjects />
        )}
        {/* Infinite scroll loader */}
        <div ref={loadMoreRef} />
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6 text-emerald-800" />
          </div>
        )}
        {!hasNextPage && allProjects.length > 0 && (
          <div className="text-center text-gray-400 py-2 text-xs">
            No more projects to load.
          </div>
        )}
      </div>

      {/* 
      // --- Pagination code commented out for infinite scroll ---
      // {projects?.data && projects?.data.length > 0 && (
      //   <div className="  ">
      //     <div className="flex justify-center ">
      //       <Pagination>
      //         <PaginationContent className="!py-0 ">
      //           <PaginationItem>
      //             <PaginationPrevious
      //               onClick={() =>
      //                 handlePageChange(
      //                   Math.max(1, projects.metadata.current_page - 1)
      //                 )
      //               }
      //               aria-disabled={projects.metadata.current_page === 1}
      //               className={
      //                 projects.metadata.current_page === 1
      //                   ? "pointer-events-none opacity-50"
      //                   : ""
      //               }
      //             />
      //           </PaginationItem>
      //           {getPageNumbers().map((page, idx) =>
      //             page === "..." ? (
      //               <PaginationItem key={idx}>
      //                 <PaginationEllipsis />
      //               </PaginationItem>
      //             ) : (
      //               <PaginationItem key={page}>
      //                 <PaginationLink
      //                   isActive={page === projects.metadata.current_page}
      //                   onClick={() =>
      //                     typeof page === "number" && handlePageChange(page)
      //                   }
      //                 >
      //                   {page}
      //                 </PaginationLink>
      //               </PaginationItem>
      //             )
      //           )}
      //           <PaginationItem>
      //             <PaginationNext
      //               onClick={() =>
      //                 handlePageChange(
      //                   Math.min(
      //                     projects.metadata.total_pages,
      //                     projects.metadata.current_page + 1
      //                   )
      //                 )
      //               }
      //               aria-disabled={
      //                 projects.metadata.current_page ===
      //                 projects.metadata.total_pages
      //               }
      //               className={
      //                 projects.metadata.current_page ===
      //                 projects.metadata.total_pages
      //                   ? "pointer-events-none opacity-50"
      //                   : ""
      //               }
      //             />
      //           </PaginationItem>
      //         </PaginationContent>
      //       </Pagination>
      //     </div>
      //   </div>
      // )}
      */}
    </div>
  );
};

export default Functions;
