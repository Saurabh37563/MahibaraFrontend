"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { MoreVertical } from "lucide-react";

interface FunctionsSidebarProps {
  children: React.ReactNode;
}

const FunctionsSidebar: React.FC<FunctionsSidebarProps> = ({ children }) => {
  const teams = [
    { id: 1, name: "Team A" },
    { id: 2, name: "Team B" },
  ];

  return (
    <div className="w-full">
      {children}
      <SidebarMenu>
        {teams.map((team) => (
          <SidebarMenuItem key={team.id} className="w-full p-0">
            <div className="flex items-center w-full">
              {/* Use div instead of Button to avoid nested button issue */}
              <div
                className="flex-1 flex items-center gap-2 whitespace-nowrap rounded-md text-sm transition-all disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                onClick={() => {
                  // Handle team selection
                }}
                role="button"
                tabIndex={0}
                aria-label={`Select team ${team.name}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    // Handle team selection
                  }
                }}
              >
                <span>{team.name}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    aria-label={`Open actions for team ${team.name}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit Team</DropdownMenuItem>
                  <DropdownMenuItem>Delete Team</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
};

export default FunctionsSidebar;
