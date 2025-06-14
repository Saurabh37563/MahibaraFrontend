import { Project } from "@/types/project-types";
import { ProjectCard } from "./project-card";

interface ProjectListProps {
  projects: Project[];
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">No projects found.</div>
    );
  }

  return (
    <div className="grid rounded-xl py-4  w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
