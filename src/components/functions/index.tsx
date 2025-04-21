'use client';

import React, { useState } from 'react';
import { IoMdAdd } from "react-icons/io";
import FilterDropdown from './filters-dropdown';
import { CiFilter } from "react-icons/ci";
import { ProjectList } from './project-list';
import CreateProjectModal from './create-project-modal';
type ProjectStatus = 'completed' | 'in-progress' | 'pending' | 'cancelled' | 'draft' | 'processing';

interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  progress: number;
  modifiedDate: string;
  team: {
    id: string;
    avatar: string;
    name: string;
    status?: 'online' | 'offline' | 'away' | 'busy' | 'none';
  }[];
}
const Functions = () => {
  const [status, setStatus] = useState("All");
  const [owner, setOwner] = useState("Everyone");
  const [sort, setSort] = useState("Newest");

  const sampleProjects: Project[] = [
    {
      id: '1',
      name: "Q1'24 Audit",
      status: 'completed',
      progress: 65,
      modifiedDate: '12/10/24',
      team: [
        { id: '1', avatar: '', name: 'Sarah Johnson', status: 'online' },
        { id: '2', avatar: '', name: 'Mark Thompson', status: 'away' },
        { id: '3', avatar: '', name: 'Jessica Lee', status: 'busy' },
        { id: '4', avatar: '', name: 'Alex Chen', status: 'offline' },
      ],
    },
    {
      id: '2',
      name:  "Q2'24 Audit",
      status: 'processing',
      progress: 100,
      modifiedDate: '01/11/24',
      team: [
        { id: '2', avatar: '', name: 'Mark Thompson', status: 'online' },
        { id: '5', avatar: '', name: 'Emma Wilson', status: 'online' },
        { id: '6', avatar: '', name: 'Daniel Brown', status: 'offline' },
      ]
    },
    {
      id: '3',
      name: "Q3'24 Audit",
      status: 'draft',
      progress: 30,
      modifiedDate: '13/12/24',
      team: [
        { id: '1', avatar: '', name: 'Sarah Johnson', status: 'busy' },
        { id: '4', avatar: '', name: 'Alex Chen', status: 'away' },
        { id: '7', avatar: '', name: 'Olivia Davis', status: 'offline' },
        { id: '8', avatar: '', name: 'James Wilson', status: 'online' },
        { id: '9', avatar: '', name: 'Sophia Miller', status: 'offline' },
      ]
    },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full  items-center justify-between">
        <span className="text-xl font-semibold">Projects</span>
        <CreateProjectModal />
      </div>

      {/* Filters */}
      <div className="flex  p-2 shadow-md rounded-xl items-center mt-10 gap-4">
        <CiFilter size={20}/>
        <FilterDropdown
          label="Status"
          options={["All", "Active", "Archived"]}
          selected={status}
          onSelect={setStatus}
        />
        <FilterDropdown
          label="Owner"
          options={["Everyone", "Me", "Team"]}
          selected={owner}
          onSelect={setOwner}
        />
        <FilterDropdown
          label="Sort by"
          options={["Newest", "Oldest", "A-Z", "Z-A"]}
          selected={sort}
          onSelect={setSort}
        />
      </div>

      <ProjectList projects={sampleProjects}/>
    </div>
  );
};

export default Functions;
