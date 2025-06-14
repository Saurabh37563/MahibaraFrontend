import { User } from "@/types/user-types";
import axios from "axios";
import React from "react";
import { FaCheck, FaChevronDown } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      console.error("Failed to fetch users:", error);
      throw new Error("Could not load users");
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
  const [dropdownPosition, setDropdownPosition] = React.useState<
    "bottom" | "top"
  >("bottom");

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  // Calculate dropdown position based on available space
  const calculateDropdownPosition = React.useCallback(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 320; // Max dropdown height

    const spaceBelow = viewportHeight - triggerRect.bottom - 20; // 20px margin
    const spaceAbove = triggerRect.top - 20; // 20px margin

    // If there's not enough space below but more space above, position on top
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      setDropdownPosition("top");
    } else {
      setDropdownPosition("bottom");
    }
  }, []);

  // Update position when opening dropdown
  React.useEffect(() => {
    if (open) {
      calculateDropdownPosition();

      const handleResize = () => calculateDropdownPosition();
      const handleScroll = () => calculateDropdownPosition();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [open, calculateDropdownPosition]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const searchUsers = React.useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Searching users with query:", query);
      const result = await usersApi.getUsers(query);
      setUsers(result || []);
    } catch (error) {
      console.error("Error searching users:", error);
      setError("Failed to fetch users. Please try again.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load initial data only once
  React.useEffect(() => {
    searchUsers("");
  }, [searchUsers]);

  // Handle search with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery === "") {
        searchUsers(searchQuery);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleUserSelect = React.useCallback(
    (user: UserApiType, event?: React.MouseEvent) => {
      // Prevent event bubbling to parent components
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Convert UserApiType to User type
      const selectedUser: User = {
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

      console.log("User selected:", selectedUser);
      onUserSelect(selectedUser);
      setOpen(false);
    },
    [onUserSelect]
  );

  const handleSearchChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      setSearchQuery(e.target.value);
    },
    []
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();
      if (e.key === "Escape") {
        setOpen(false);
      }
    },
    []
  );

  const handleTriggerClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!open);
    },
    [open]
  );

  const handleTriggerKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(!open);
      }
    },
    [open]
  );

  // Get initials from user name for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative w-full">
      {/* Trigger */}
      <div
        ref={triggerRef}
        role="combobox"
        aria-expanded={open}
        aria-controls="user-search-dropdown"
        aria-haspopup="listbox"
        className="w-full min-h-[2.5rem] sm:h-10 px-3 py-2 border border-input rounded-md bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        tabIndex={0}
        onKeyDown={handleTriggerKeyDown}
        onClick={handleTriggerClick}
      >
        <div className="flex-1 min-w-0">
          {selectedUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Avatar className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0">
                <AvatarImage
                  src={selectedUser.image || undefined}
                  alt={selectedUser.name}
                />
                <AvatarFallback>
                  {getInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm sm:text-base truncate font-medium">
                {selectedUser.name}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm sm:text-base">
              Select organization head...
            </span>
          )}
        </div>
        <FaChevronDown
          className={`ml-2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          id="user-search-dropdown"
          role="listbox"
          className={`absolute left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden ${
            dropdownPosition === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{
            maxHeight: "320px",
          }}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-border bg-muted/50 flex-shrink-0">
            <input
              className="w-full px-3 py-2 border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          {/* Content */}
          <div className="overflow-y-auto" style={{ maxHeight: "250px" }}>
            {isLoading && (
              <div className="flex items-center justify-center p-6">
                <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Searching...
                </span>
              </div>
            )}

            {error && (
              <div className="p-4 text-sm text-destructive bg-destructive/10 border-l-4 border-destructive mx-2 my-2 rounded">
                {error}
              </div>
            )}

            {!isLoading &&
              users.length === 0 &&
              searchQuery.length >= 2 &&
              !error && (
                <div className="p-6 text-sm text-muted-foreground text-center">
                  No users found matching &quot;{searchQuery}&quot;
                </div>
              )}

            {!isLoading && users.length > 0 && (
              <div className="py-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-accent cursor-pointer transition-colors duration-150 active:bg-accent/80 mx-1 rounded"
                    onClick={(e) => handleUserSelect(user, e)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleUserSelect(user);
                      }
                    }}
                  >
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name || "User avatar"}
                      />
                      <AvatarFallback>
                        {getInitials(user.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-medium text-foreground truncate">
                        {user.name}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">
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
                    {selectedUser?.id === user.id && (
                      <FaCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
