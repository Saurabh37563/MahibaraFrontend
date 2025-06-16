"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, Plus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { BASE_TEMP_BACKEND_URL } from "@/constants/endpoints-constant";
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

type UserApiType = {
  id: number;
  name: string;
  email: string;
  designation: string | null;
  image?: string | null;
};

const usersApi = {
  getUsers: async (search = "") => {
    try {
      const response = await axios.get(
        `${BASE_TEMP_BACKEND_URL}/api/v1/teams/user-info`,
        {
          params: { search },
        }
      );
      return response.data?.data;
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
  const [users, setUsers] = React.useState<UserApiType[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [tempSelectedUsers, setTempSelectedUsers] = React.useState<
    UserApiType[]
  >([]);

  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const result = await usersApi.getUsers(searchQuery);
        setUsers(result || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [searchQuery, open]);

  const availableUsers = React.useMemo(() => {
    if (!users || !Array.isArray(users)) return [];
    if (!selectedMembers || !Array.isArray(selectedMembers)) return users;

    const selectedIds = new Set(
      selectedMembers.map((m) => m?.id?.toString()).filter(Boolean)
    );
    return users.filter((user) => !selectedIds.has(user.id.toString()));
  }, [users, selectedMembers]);

  const handleToggleUser = (user: UserApiType) => {
    setTempSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleAddSelectedUsers = () => {
    const newMembers: TeamMemberWithPermission[] = tempSelectedUsers.map(
      (user) => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        position: user.designation || "No designation",
        avatarUrl: user.image,
        permission: "view",
        modulePermissions: {
          projects: "view",
          analytics: "view",
          file_processing: "no_access",
        },
      })
    );
    onMembersChange([...selectedMembers, ...newMembers]);
    setTempSelectedUsers([]);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempSelectedUsers([]);
    setOpen(false);
  };

  const handleModulePermissionChange = (
    memberId: string,
    module: ModuleType,
    permission: AccessLevel
  ) => {
    const updatedMembers = selectedMembers.map((member) => {
      if (member.id !== memberId) return member;

      return {
        ...member,
        modulePermissions: {
          ...(member.modulePermissions || {
            projects: "view" as const,
            analytics: "view" as const,
            file_processing: "no_access" as const,
          }),
          [module]: permission,
        },
        permission: "view" as const,
      };
    });

    onMembersChange(updatedMembers);
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
    <div className="space-y-4 w-full">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="text-left font-normal">Add team members...</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Add Team Members</DialogTitle>
            <DialogDescription>
              Search and select multiple team members to add to your team.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-full overflow-hidden">
            <Command className="rounded-lg border-0 shadow-none flex-1">
              <CommandInput
                placeholder="Search users..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList className="max-h-[350px] overflow-y-auto">
                <CommandEmpty>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    "No users found."
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {availableUsers.map((user) => {
                    const isSelected = tempSelectedUsers.some(
                      (u) => u.id === user.id
                    );
                    return (
                      <CommandItem
                        key={user.id}
                        value={`${user.name} ${user.email}`}
                        onSelect={() => handleToggleUser(user)}
                        className="flex items-center space-x-3 p-3"
                      >
                        <div className="flex items-center space-x-3 flex-1">
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
                            <div className="flex flex-col text-xs text-muted-foreground mt-1">
                              <span className="truncate">{user.email}</span>
                              <span className="truncate">
                                {user.designation || "No designation"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Check
                          className={`h-4 w-4 ${
                            isSelected ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
            {tempSelectedUsers.length > 0 && (
              <div className="border-t p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">
                    {tempSelectedUsers.length} user
                    {tempSelectedUsers.length > 1 ? "s" : ""} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTempSelectedUsers([])}
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tempSelectedUsers.map((user) => (
                    <Badge
                      key={user.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {user.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleToggleUser(user)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 p-4 border-t bg-background">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleAddSelectedUsers}
                disabled={tempSelectedUsers.length === 0}
              >
                Add{" "}
                {tempSelectedUsers.length > 0
                  ? `${tempSelectedUsers.length} `
                  : ""}
                Member{tempSelectedUsers.length > 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <Table className="w-full min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px] w-[180px] sticky left-0 bg-background z-20 border-r shadow-sm">
                      Member
                    </TableHead>
                    {MODULES.map((module) => (
                      <TableHead
                        key={module.value}
                        className="text-center min-w-[140px] w-[140px]"
                      >
                        {module.label}
                      </TableHead>
                    ))}
                    <TableHead className="w-[70px] min-w-[70px] sticky right-0 bg-background z-20 border-l shadow-sm">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="sticky left-0 bg-background z-10 border-r shadow-sm p-3">
                        <div className="flex items-center space-x-3 min-w-0">
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
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium truncate max-w-[120px]">
                              {member.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {member.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      {MODULES.map((module) => (
                        <TableCell
                          key={module.value}
                          className="text-center p-2"
                        >
                          <Select
                            value={
                              (member.modulePermissions &&
                                member.modulePermissions[module.value]) ||
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
                            <SelectTrigger className="w-[130px] mx-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PERMISSION_LEVELS.map((level) => (
                                <SelectItem
                                  key={level.value}
                                  value={level.value}
                                >
                                  <Badge
                                    variant="outline"
                                    className={`${getPermissionBadgeVariant(
                                      level.value
                                    )} border-0`}
                                  >
                                    {level.label}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      ))}
                      <TableCell className="sticky right-0 bg-background z-10 border-l shadow-sm p-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
