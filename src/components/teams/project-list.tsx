'use client'
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatargroup';
import { CiFolderOn } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";
import { useRouter } from 'next/navigation';
import { useTeamContext, type Project as ContextProject } from '@/contexts/team-context';

// Define project status types and their corresponding colors
type ProjectStatus = 'completed' | 'in-progress' | 'pending' | 'cancelled' | 'draft' | 'processing';

const statusColorMap: Record<ProjectStatus, string> = {
  'completed': 'green-800',
  'in-progress': 'blue-800',
  'pending': 'yellow-800',
  'cancelled': 'red-800',
  'draft': 'gray-400',
  'processing': 'yellow-600',
};

const getStatusClasses = (status: ProjectStatus) => {
  switch (status) {
    case 'completed': return 'border-green-800 text-green-800 ';
    case 'in-progress': return 'border-blue-800 text-blue-700 ';
    case 'cancelled': return 'border-red-800 text-red-800 ';
    case 'draft': return 'border-gray-400 text-gray-400 ';
    case 'processing': return 'border-yellow-600/70 text-yellow-600/70 ';
    default: return '';
  }
};

// Define progress color based on percentage
const getProgressColor = (status: ProjectStatus): string => {
  switch (status) {
    case 'completed': return 'bg-green-800';
    case 'in-progress': return 'bg-blue-800';
    case 'pending': return 'bg-yellow-800';
    case 'cancelled': return 'bg-red-800';
    case 'draft': return 'bg-gray-400';
    case 'processing': return 'bg-yellow-600';
    default: return '';
  }
};

interface ProjectCardProps {
  project: ContextProject;
}

// Individual Project Card Component
const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const router = useRouter();
  // Cast the status to ProjectStatus type to ensure it works with our maps
  const status = project.status as ProjectStatus;
  
  return (
    <div 
      onClick={() => router.push(`/functions/${project.id}`)} 
      className={`border ${getStatusClasses(status)} bg-white dark:bg-gray-800 rounded-lg shadow p-5 transition-all hover:shadow-md`}
    >
      {/* Header with folder icon and status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <CiFolderOn className={`h-6 w-6 stroke-1 text-${statusColorMap[status]} mr-2`} />
          <span className={`text-xs font-medium px-2.5 py-0.5 text-gray-800`}>
            {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
      </div>
      
      {/* Progress bar section */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">{project?.name}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getProgressColor(status)}`} 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Footer with date and team avatars */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <IoMdTime className="h-4 w-4 mr-1" />
          <div className='flex flex-col text-xs items-start'>
            <span>Modified </span>
            <span>{project.modifiedDate}</span>
          </div>
        </div>
        
        <AvatarGroup className='text-xs p-2'>
          {project.team.length > 0 ? (
            // Map through actual team members from context
            project.team.map((member, index) => (
              <Avatar key={member.id || index}>
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            ))
          ) : (
            // Fallback placeholders if no team members
            <>
              <Avatar><AvatarFallback>U1</AvatarFallback></Avatar>
              <Avatar><AvatarFallback>U2</AvatarFallback></Avatar>
            </>
          )}
        </AvatarGroup>
      </div>
    </div>
  );
};

interface ProjectListProps {
  projects?: ContextProject[];
}

// Main component to render the list of project cards
export const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  // Get projects from context if not provided as props
  const { projects: contextProjects, isLoadingProjects } = useTeamContext();
  const projectsToRender = projects || contextProjects;
  
  if (isLoadingProjects) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 rounded-full border-t-green-800"></div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projectsToRender.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};