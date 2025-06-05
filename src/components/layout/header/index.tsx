"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Search, ChevronDown, LogOut, HelpCircle, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { signOut } from "next-auth/react";
import { useAuth } from "@/contexts/auth-context";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { FiSidebar } from "react-icons/fi";

const queryClient = new QueryClient();

function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Types
interface UserData {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  image?: string;
  loginName?: string;
  role?: string;
}

// Add a type for the auth context user
interface AuthUser {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  image?: string;
  loginName?: string;
  userType?: string;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  path: string;
}

interface SearchResponse {
  results: SearchResult[];
  nextCursor: string | null;
  totalCount: number;
}

// Routes that should display the search bar
const SEARCHABLE_ROUTES = [
  "/dashboard",
  "/users",
  "/projects",
  "/analytics",
  "/reports",
  "/settings/general",
  "/functions",
];

const fetchSearchResults = async ({
  query = "",
  cursor = null,
  limit = 10,
}: {
  query: string;
  cursor: string | null;
  limit?: number;
}): Promise<SearchResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const allResults = [
    {
      id: "fn-1",
      title: "Data Processing",
      description: "Process raw data into structured format",
      type: "function",
      path: "/functions/fn-1",
    },
    {
      id: "fn-2",
      title: "Text Analysis",
      description: "Analyze text for sentiment and keywords",
      type: "function",
      path: "/functions/fn-2",
    },
    {
      id: "fn-3",
      title: "Image Recognition",
      description: "Identify objects in images",
      type: "function",
      path: "/functions/fn-3",
    },
    {
      id: "fn-4",
      title: "Natural Language Processing",
      description: "Process and understand human language",
      type: "function",
      path: "/functions/fn-4",
    },
    {
      id: "fn-5",
      title: "Time Series Analysis",
      description: "Analyze time-based data patterns",
      type: "function",
      path: "/functions/fn-5",
    },
    {
      id: "fn-6",
      title: "Predictive Modeling",
      description: "Create models to predict outcomes",
      type: "function",
      path: "/functions/fn-6",
    },
    {
      id: "fn-7",
      title: "Data Visualization",
      description: "Create visual representations of data",
      type: "function",
      path: "/functions/fn-7",
    },
    {
      id: "fn-8",
      title: "Anomaly Detection",
      description: "Identify outliers in datasets",
      type: "function",
      path: "/functions/fn-8",
    },
    {
      id: "fn-9",
      title: "Clustering Algorithm",
      description: "Group similar data points",
      type: "function",
      path: "/functions/fn-9",
    },
    {
      id: "fn-10",
      title: "Classification Model",
      description: "Categorize data into classes",
      type: "function",
      path: "/functions/fn-10",
    },
    {
      id: "fn-11",
      title: "Regression Analysis",
      description: "Predict continuous values",
      type: "function",
      path: "/functions/fn-11",
    },
    {
      id: "fn-12",
      title: "Data Enrichment",
      description: "Add context to existing data",
      type: "function",
      path: "/functions/fn-12",
    },
    {
      id: "fn-13",
      title: "Feature Extraction",
      description: "Identify important attributes in data",
      type: "function",
      path: "/functions/fn-13",
    },
    {
      id: "fn-14",
      title: "Summarization",
      description: "Create concise summaries of data",
      type: "function",
      path: "/functions/fn-14",
    },
    {
      id: "fn-15",
      title: "Entity Recognition",
      description: "Identify entities in text",
      type: "function",
      path: "/functions/fn-15",
    },
  ];

  const filteredResults = query
    ? allResults.filter(
        (result) =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.description.toLowerCase().includes(query.toLowerCase())
      )
    : allResults;

  const startIndex = cursor ? parseInt(cursor) : 0;
  const endIndex = startIndex + limit;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  const nextCursorValue =
    endIndex < filteredResults.length ? endIndex.toString() : null;

  return {
    results: paginatedResults,
    nextCursor: nextCursorValue,
    totalCount: filteredResults.length,
  };
};

const HeaderContent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { ref: loadMoreRef, inView } = useInView();
  const auth = useAuth();
  const sidebarContext = useSidebar();
  const { isOpen = false, isMobile = false } = (sidebarContext || {}) as {
    isOpen?: boolean;
    isMobile?: boolean;
  };
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Map auth.user to UserData shape, fallback only if missing
  const rawUser = auth.user as AuthUser | null | undefined;

  const user: UserData | null = rawUser
    ? {
        id: rawUser.id,
        name: rawUser.name ?? "",
        firstName: rawUser.firstName ?? "",
        lastName: rawUser.lastName ?? "",
        email: rawUser.email ?? "",
        avatar: rawUser.image ?? undefined,
        image: rawUser.image ?? undefined,
        loginName: rawUser.loginName ?? "",
        role: rawUser.userType ?? "User",
      }
    : null;

  const shouldShowSearch = SEARCHABLE_ROUTES.some(
    (route) => pathname?.startsWith(route) || false
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["searchResults", debouncedQuery],
    queryFn: ({ pageParam }: { pageParam?: string | null }) =>
      fetchSearchResults({
        query: debouncedQuery,
        cursor: pageParam ?? null,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: debouncedQuery.length > 0 && commandOpen,
  });

  const allResults = React.useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.results);
  }, [data]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelectSearchResult = useCallback(
    (path: string) => {
      setCommandOpen(false);
      setSearchQuery("");
      router.push(path);
    },
    [router]
  );

  const handleCommandClose = useCallback(() => {
    setCommandOpen(false);
    setSearchQuery("");
  }, []);

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.firstName || user.lastName) {
      return (
        (
          (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")
        ).toUpperCase() || "U"
      );
    }
    if (user.name) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase();
    }
    return "U";
  };

  const isFunctionsPage = pathname === "/functions";

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full mx-auto px-2">
          <div className="flex justify-between items-center h-16">
            {/* Left section - Logo */}
            <div className="flex items-center ">
              {isMobile && !isOpen && isFunctionsPage && (
                <SidebarTrigger className=" size-10">
                  <FiSidebar size={40} />
                </SidebarTrigger>
              )}
              <Link href="/" className="flex-shrink-0">
                <div className="h-8 w-auto font-bold text-xl flex items-center">
                  <span className="text-green-950 px-2 py-1 rounded">M&AI</span>
                </div>
              </Link>
            </div>

            {/* Middle section - Search Bar */}
            {shouldShowSearch && (
              <div className="hidden md:block flex-1 max-w-md mx-8">
                <Button
                  variant="outline"
                  className="w-full justify-between text-muted-foreground text-sm"
                  onClick={() => setCommandOpen(true)}
                >
                  <div className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search functions...</span>
                  </div>
                  <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </div>
            )}

            {/* Right section - User Profile */}
            <div className="flex items-center space-x-4">
              {/* Search toggle for mobile */}
              {shouldShowSearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setCommandOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 h-10"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.image || undefined}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>

                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName || user?.lastName
                          ? `${user?.firstName ?? ""} ${
                              user?.lastName ?? ""
                            }`.trim()
                          : user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem> */}
                  <DropdownMenuItem
                    onClick={() => router.push("/help-and-support")}
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Command Dialog for Search */}
      <CommandDialog open={commandOpen} onOpenChange={handleCommandClose}>
        <CommandInput
          placeholder="Search functions..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isLoading && debouncedQuery ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <div className="animate-spin mb-2 mx-auto h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              <p>Searching...</p>
            </div>
          ) : isError ? (
            <div className="py-6 text-center text-sm text-destructive">
              <p>Something went wrong. Please try again.</p>
            </div>
          ) : debouncedQuery.length === 0 ? (
            <CommandEmpty>Start typing to search...</CommandEmpty>
          ) : allResults.length === 0 ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            <>
              <CommandGroup heading="Functions">
                <ScrollArea className="h-[300px]">
                  {allResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.id}
                      onSelect={() => handleSelectSearchResult(result.path)}
                    >
                      <div className="flex flex-col space-y-1">
                        <p>{result.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.description}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                  {hasNextPage && (
                    <div
                      ref={loadMoreRef}
                      className="py-2 text-center text-sm text-muted-foreground"
                    >
                      {isFetchingNextPage ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin mr-2 h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                          <span>Loading more...</span>
                        </div>
                      ) : (
                        "Scroll for more results"
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
};

// Header component with QueryClientProvider
const Header = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HeaderContent />
    </QueryClientProvider>
  );
};

export default Header;
