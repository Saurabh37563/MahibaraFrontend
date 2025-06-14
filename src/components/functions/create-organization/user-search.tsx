// --- Shadcn UI implementation below ---

import * as React from "react";
import { User } from "@/types/user-types";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { BASE_TEMP_BACKEND_URL } from "@/constants/endpoints-constant";

interface UserSearchProps {
  onUserSelect: (user: User | null) => void;
  selectedUser: User | null;
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
      throw new Error("Could not load users");
    }
  },
  getUserById: async (id: number) => {
    try {
      const response = await axios.get(
        `${BASE_TEMP_BACKEND_URL}/api/v1/teams/user-info`,
        {
          params: { id },
        }
      );
      const users = response.data?.data;
      if (Array.isArray(users)) {
        return users.find((u: UserApiType) => u.id === id) || null;
      }
      return null;
    } catch {
      return null;
    }
  },
};

export default function UserSearch({
  onUserSelect,
  selectedUser,
}: UserSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [users, setUsers] = React.useState<UserApiType[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resolvedSelectedUser, setResolvedSelectedUser] =
    React.useState<User | null>(selectedUser);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // If selectedUser is only {id}, fetch full user info
  React.useEffect(() => {
    let ignore = false;
    const resolveUser = async () => {
      if (selectedUser && (!selectedUser.name || !selectedUser.email)) {
        const user = await usersApi.getUserById(selectedUser.id);
        if (!ignore) {
          if (user) {
            setResolvedSelectedUser({
              id: user.id,
              name: user.name,
              email: user.email,
              designation: user.designation || null,
              image: user.image || null,
              organizationId: null,
              organizationName: null,
              createdAt: null,
              updatedAt: null,
            });
          } else {
            setResolvedSelectedUser(null);
          }
        }
      } else {
        setResolvedSelectedUser(selectedUser);
      }
    };
    resolveUser();
    return () => {
      ignore = true;
    };
  }, [selectedUser]);

  const searchUsers = React.useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await usersApi.getUsers(query);
      setUsers(result || []);
    } catch {
      setError("Failed to fetch users. Please try again.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    searchUsers("");
  }, [searchUsers]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery === "") {
        searchUsers(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleUserSelect = React.useCallback(
    (user: UserApiType) => {
      const selected: User = {
        id: user.id,
        name: user.name,
        email: user.email,
        designation: user.designation || null,
        image: user.image || null,
        organizationId: null,
        organizationName: null,
        createdAt: null,
        updatedAt: null,
      };
      onUserSelect(selected);
      setResolvedSelectedUser(selected);
      setOpen(false);
    },
    [onUserSelect]
  );

  const getInitials = (name: string | undefined | null): string => {
    if (!name || typeof name !== "string") return "";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Popover open={open} modal={true} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          className="w-full justify-between"
          aria-label="Select organization admin"
        >
          {resolvedSelectedUser ? (
            <span className="flex items-center gap-2 truncate">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={resolvedSelectedUser.image || undefined}
                  alt={resolvedSelectedUser.name}
                />
                <AvatarFallback>
                  {getInitials(resolvedSelectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{resolvedSelectedUser.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">
              Select organization head...
            </span>
          )}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        style={{
          width: triggerRef.current?.offsetWidth || "auto",
        }}
        className="w-autoshadow-lg p-0 rounded-lg  border bg-white"
      >
        <div className="p-3 border-b">
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full"
            aria-label="Search users"
          />
        </div>
        <div className="max-h-64 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          )}
          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 border-l-4 border-destructive rounded">
              {error}
            </div>
          )}
          {!isLoading &&
            users.length === 0 &&
            searchQuery.length >= 2 &&
            !error && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No users found matching &quot;{searchQuery}&quot;
              </div>
            )}
          {!isLoading && users.length > 0 && (
            <div className="flex flex-col items-center">
              {users.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="w-full flex  items-center gap-4 px-4 py-8 justify-start hover:bg-gray-100 rounded-none"
                  onClick={() => handleUserSelect(user)}
                  aria-label={`Select ${user.name}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name || "User avatar"}
                    />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user.email}
                      {user.designation && (
                        <>
                          <span className="hidden sm:inline"> • </span>
                          <span className="block sm:inline text-xs">
                            {user.designation}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {resolvedSelectedUser?.id === user.id && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
