'use client';

import React from 'react';
import { useTeamContext } from '../../../contexts/team-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { IoMdAdd } from "react-icons/io";
import CreateTeam from '../create-team';

const DesktopSidebar = () => {
  const { 
    activeOrg, 
    setActiveOrg, 
    activeTeam, 
    setActiveTeam, 
    organizations, 
    teams, 
    isLoadingOrgs,
    isLoadingTeams
  } = useTeamContext();

  return (
    <div className="w-64 h-[calc(100vh-var(--header-height))] p-4 border-r border-gray-200 overflow-y-auto">
      <div className="space-y-4">
        <div>
          {isLoadingOrgs ? (
            <div className="flex items-center space-x-2 mt-1 h-10 px-3 rounded-md border border-input bg-background">
              <div className="animate-pulse h-4 w-full bg-gray-200 rounded"></div>
            </div>
          ) : (
            <Select 
              value={activeOrg?.id} 
              onValueChange={(value) => {
                const org = organizations.find(o => o.id === value);
                if (org) {
                  setActiveOrg(org);
                  setActiveTeam(null); // Reset team when org changes
                }
              }}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={org.avatar} />
                        <AvatarFallback>{org.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {org.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-500">Teams</label>
            <CreateTeam />
          </div>
          
          {isLoadingTeams ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse h-9 w-full bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : teams.length > 0 ? (
            <ul className="space-y-1">
              {teams.map(team => (
                <li key={team.id}>
                  <Button
                    variant={activeTeam?.id === team.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setActiveTeam(team)}
                  >
                    {team.name}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500 py-2">
              {activeOrg ? "No teams available" : "Select an organization"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopSidebar;