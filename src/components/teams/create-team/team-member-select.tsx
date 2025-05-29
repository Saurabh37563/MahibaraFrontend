"use client";

import * as React from "react";
import { ChevronsUpDown, Loader2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  TeamMemberWithPermission,
  AccessLevel,
  ModuleType,
} from "@/types/team-types";
import axios from "axios";

const PERMISSION_LEVELS: {
  value: AccessLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "no_access",
    label: "No Access",
    description: "Cannot access this module",
  },
  {
    value: "view",
    label: "View",
    description: "Can view content only",
  },
  {
    value: "edit",
    label: "Edit",
    description: "Can modify content",
  },
  {
    value: "manage",
    label: "Manage",
    description: "Full administrative access",
  },
];

const MODULES: {
  value: ModuleType;
  label: string;
  description: string;
}[] = [
  {
    value: "projects",
    label: "Projects",
    description: "Project management",
  },
  {
    value: "analytics",
    label: "Analytics",
    description: "Data analytics and reporting",
  },
  {
    value: "file_processing",
    label: "File Processing",
    description: "File handling and processing",
  },
];

interface TeamMemberSelectorProps {
  selectedMembers: TeamMemberWithPermission[];
  onMembersChange: (members: TeamMemberWithPermission[]) => void;
}

// Mock users API (replace with your actual API)
// const usersApi = {
//   getUsers: async (search = "") => {
//     await new Promise((resolve) => setTimeout(resolve, 500));
//     const users = [
//       {
//         id: "1",
//         name: "Saurabh Kumar",
//         email: "saurabh@email.com",
//         position: "Frontend Developer",
//         image: "https://github.com/shadcn.png",
//       },
//       {
//         id: "2",
//         name: "John Doe",
//         email: "john@email.com",
//         position: "Backend Developer",
//         image: "https://github.com/shadcn.png",
//       },
//       {
//         id: "3",
//         name: "Jane Smith",
//         email: "jane@email.com",
//         position: "UI Designer",
//         image: null,
//       },
//     ];

//     if (search) {
//       const searchLower = search.toLowerCase();
//       return users.filter(
//         (user) =>
//           user.name.toLowerCase().includes(searchLower) ||
//           user.email.toLowerCase().includes(searchLower) ||
//           user.position.toLowerCase().includes(searchLower)
//       );
//     }
//     return users;
//   },
// };

const usersApi = {
  getUsers: async (search = "") => {
    try {
      const response = await axios.get(
        "http://192.168.1.63:8000/api/v1/teams/user-info",
        {
          params: { search },
        }
      );
      return response.data?.data; // Assuming the API returns a list of users
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw new Error("Could not load users");
    }
  },
};

export function TeamMemberSelector({
  selectedMembers = [],
  onMembersChange,
}: TeamMemberSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const result = await usersApi.getUsers(search);
        setUsers(result);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [search]);

  const availableUsers = React.useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    if (!selectedMembers || !Array.isArray(selectedMembers)) return users;
    const selectedIds = new Set(
      selectedMembers.map((m) => m?.id).filter(Boolean)
    );
    return users.filter((user) => !selectedIds.has(user.id));
  }, [users, selectedMembers]);

  const handleSelectUser = (user: any) => {
    const newMember: TeamMemberWithPermission = {
      id: user.id,
      name: user.name,
      email: user.email,
      position: user.position,
      avatarUrl: user.image,
      permission: "view",
      modulePermissions: {
        projects: "view",
        analytics: "view",
        file_processing: "no_access",
      },
    };
    onMembersChange([...selectedMembers, newMember]);
    setOpen(false);
    setSearch("");
  };

  const handleModulePermissionChange = (
    memberId: string,
    module: ModuleType,
    permission: AccessLevel
  ) => {
    onMembersChange(
      selectedMembers.map((member) => {
        if (member.id !== memberId) return member;
        return {
          ...member,
          modulePermissions: {
            ...(member.modulePermissions || {
              projects: "view",
              analytics: "view",
              file_processing: "no_access",
            }),
            [module]: permission,
          },
          permission: "view",
        };
      })
    );
  };

  const handleRemoveMember = (memberId: string) => {
    onMembersChange(selectedMembers.filter((member) => member.id !== memberId));
  };

  const getPermissionBadgeVariant = (permission: AccessLevel): string => {
    switch (permission) {
      case "manage":
        return "bg-blue-100 text-blue-800";
      case "edit":
        return "bg-green-100 text-green-800";
      case "view":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4 w-full overflow-x-hidden">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span className="text-left font-normal truncate">
              {search || "Search team members..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-2 h-full overflow-y-scroll   w-[var(--radix-popover-trigger-width)]"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Input
            placeholder="Search users..."
            className="mb-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ScrollArea className="rounded-md max-h-72 ">
            <div className="p-2 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading...</span>
                </div>
              ) : availableUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users found
                </p>
              ) : (
                availableUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.image || "/placeholder.svg"}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">
                        {user.name}
                      </p>
                      <div className="flex flex-col sm:flex-row text-xs text-muted-foreground gap-x-1">
                        <span className="truncate">{user.email}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{user.position}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {selectedMembers.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Team Members ({selectedMembers.length})
            </h3>
            {selectedMembers.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMembersChange([])}
              >
                Clear all
              </Button>
            )}
          </div>
          <ScrollArea className="w-full overflow-x-auto">
            <div className="w-full border rounded-md inline-block">
              <Table className="w-full rounded-md">
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    {MODULES.map((module) => (
                      <TableHead key={module.value} className="text-center">
                        {module.label}
                      </TableHead>
                    ))}
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage
                              src={member.avatarUrl || undefined}
                              alt={member.name}
                            />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate">
                              {member.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      {MODULES.map((module) => (
                        <TableCell key={module.value} className="text-center">
                          <Select
                            value={
                              member.modulePermissions?.[module.value] ||
                              "no_access"
                            }
                            onValueChange={(value: AccessLevel) =>
                              handleModulePermissionChange(
                                member.id,
                                module.value,
                                value
                              )
                            }
                          >
                            <SelectTrigger className="w-32 mx-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PERMISSION_LEVELS.map((level) => (
                                <SelectItem
                                  key={level.value}
                                  value={level.value}
                                >
                                  <div className="flex items-center w-full">
                                    <Badge
                                      variant="outline"
                                      className={getPermissionBadgeVariant(
                                        level.value
                                      )}
                                    >
                                      {level.label}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </>
      )}
    </div>
  );
}
