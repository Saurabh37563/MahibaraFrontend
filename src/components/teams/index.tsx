'use client';

import React from 'react';
import Functions from './project-layout';
import FunctionsSidebar from './teams-sidebar';
import { TeamDashboardProvider } from '@/contexts/team-context';

const TeamDashboard = () => {
  return (
    <TeamDashboardProvider>
      {/* Use a simpler layout with grid instead of flex */}
      <div className='grid grid-cols-[auto_1fr] h-[calc(100vh-var(--header-height))]'>
        <FunctionsSidebar />
        <div className='p-4 overflow-auto '>
          <Functions />
        </div>
      </div>
    </TeamDashboardProvider>
  );
};

export default TeamDashboard;