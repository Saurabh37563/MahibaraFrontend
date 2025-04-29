'use client';

import React from 'react';
import { useTeamContext } from '../../contexts/team-context';
import FilterDropdown from './filters-dropdown';
import { ProjectList } from './project-list';
import CreateProjectModal from './create-project-modal';

const EmptyTeamState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-4 py-24">
    <div className="bg-gray-100 p-6 rounded-full mb-4">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    </div>
    <h3 className="text-xl font-semibold mb-2">No Team Selected</h3>
    <p className="text-gray-500 mb-6 max-w-md">
      Please select a team from the sidebar to view and manage projects for that team.
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
  const { 
    activeTeam, 
    projects, 
    isLoadingProjects 
  } = useTeamContext();

  if (!activeTeam) {
    return <EmptyTeamState />;
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-var(--header-height))] gap-4">
      <div className="flex w-full items-center justify-between">
        <span className="text-xl font-semibold">Projects for {activeTeam.name}</span>
        <CreateProjectModal />
      </div>

      <FilterDropdown />

      {isLoadingProjects ? (
        <LoadingProjects />
      ) : projects.length > 0 ? (
        <ProjectList projects={projects} />
      ) : (
        <EmptyProjects />
      )}
    </div>
  );
};

export default Functions;