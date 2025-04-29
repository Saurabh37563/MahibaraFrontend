'use client';

import React, { useEffect } from 'react';
import { useTeamContext } from '../../../contexts/team-context';
import { FiX } from "react-icons/fi";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IoMdAdd } from 'react-icons/io';
import CreateTeam from '../create-team';

interface MobileSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { 
    activeOrg, 
    setActiveOrg, 
    activeTeam, 
    setActiveTeam, 
    organizations, 
    teams, 
    isLoadingTeams 
  } = useTeamContext();
  
  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-[280px] bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">Menu</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <FiX className="size-5" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-60px)]">
          <div>
            <label className="text-sm font-medium text-gray-500">Organization</label>
            <Select 
              value={activeOrg?.id} 
              onValueChange={(value) => {
                const org = organizations.find(o => o.id === value);
                if (org) {
                  setActiveOrg(org);
                  setActiveTeam(null);
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
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-500">Teams</label>
              <CreateTeam />
            </div>
            
            {isLoadingTeams ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-5 w-5 border-2 border-gray-300 rounded-full border-t-blue-500"></div>
              </div>
            ) : teams.length > 0 ? (
              <ul className="space-y-1">
                {teams.map(team => (
                  <li key={team.id}>
                    <Button
                      variant={activeTeam?.id === team.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left font-normal"
                      onClick={() => {
                        setActiveTeam(team);
                        toggleSidebar();
                      }}
                    >
                      {team.name}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 py-2">No teams available</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;