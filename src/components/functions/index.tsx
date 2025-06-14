"use client";

import React from "react";
import Functions from "./project-layout";
import FunctionsSidebar from "./teams-sidebar";

const TeamDashboard = () => {
  return (
    <div className="grid md:grid-cols-[auto_1fr] h-[calc(100vh-var(--header-height))]">
      <FunctionsSidebar />
      <div className="p-2 overflow-auto ">
        <Functions />
      </div>
    </div>
  );
};

export default TeamDashboard;
