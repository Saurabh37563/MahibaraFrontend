"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  QueryClient, 
  QueryClientProvider,
  useInfiniteQuery 
} from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { 
  Search, X, Menu, ChevronDown, 
  Settings, LogOut, HelpCircle, User
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";

// Create a client
const queryClient = new QueryClient();

// Custom useDebounce hook
function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if the value changes or component unmounts
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
  email: string;
  avatar?: string;
  role: string;
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

// User Context
const UserContext = createContext<UserData | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Dummy user data - in a real app this would come from authentication
  const userData: UserData = {
    id: "user-1",
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://github.com/shadcn.png",
    role: "Admin"
  };

  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
}

function useUser() {
  const context = useContext(UserContext);
  // Modified to safely handle cases where context is null
  return context || {
    id: "",
    name: "Guest User",
    email: "guest@example.com",
    role: "Guest"
  };
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

// Mock function to fetch search results - replace with actual API call
const fetchSearchResults = async ({ 
  query = "", 
  cursor = null,
  limit = 10
}: { 
  query: string, 
  cursor: string | null,
  limit?: number
}): Promise<SearchResponse> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data for search results
  const allResults = [
    { id: "fn-1", title: "Data Processing", description: "Process raw data into structured format", type: "function", path: "/functions/fn-1" },
    { id: "fn-2", title: "Text Analysis", description: "Analyze text for sentiment and keywords", type: "function", path: "/functions/fn-2" },
    { id: "fn-3", title: "Image Recognition", description: "Identify objects in images", type: "function", path: "/functions/fn-3" },
    { id: "fn-4", title: "Natural Language Processing", description: "Process and understand human language", type: "function", path: "/functions/fn-4" },
    { id: "fn-5", title: "Time Series Analysis", description: "Analyze time-based data patterns", type: "function", path: "/functions/fn-5" },
    { id: "fn-6", title: "Predictive Modeling", description: "Create models to predict outcomes", type: "function", path: "/functions/fn-6" },
    { id: "fn-7", title: "Data Visualization", description: "Create visual representations of data", type: "function", path: "/functions/fn-7" },
    { id: "fn-8", title: "Anomaly Detection", description: "Identify outliers in datasets", type: "function", path: "/functions/fn-8" },
    { id: "fn-9", title: "Clustering Algorithm", description: "Group similar data points", type: "function", path: "/functions/fn-9" },
    { id: "fn-10", title: "Classification Model", description: "Categorize data into classes", type: "function", path: "/functions/fn-10" },
    { id: "fn-11", title: "Regression Analysis", description: "Predict continuous values", type: "function", path: "/functions/fn-11" },
    { id: "fn-12", title: "Data Enrichment", description: "Add context to existing data", type: "function", path: "/functions/fn-12" },
    { id: "fn-13", title: "Feature Extraction", description: "Identify important attributes in data", type: "function", path: "/functions/fn-13" },
    { id: "fn-14", title: "Summarization", description: "Create concise summaries of data", type: "function", path: "/functions/fn-14" },
    { id: "fn-15", title: "Entity Recognition", description: "Identify entities in text", type: "function", path: "/functions/fn-15" },
  ];
  
  // Filter results by search query if provided
  const filteredResults = query 
    ? allResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) || 
        result.description.toLowerCase().includes(query.toLowerCase())
      )
    : allResults;
  
  // Implement cursor-based pagination
  const startIndex = cursor ? parseInt(cursor) : 0;
  const endIndex = startIndex + limit;
  const paginatedResults = filteredResults.slice(startIndex, endIndex);
  
  // Determine if there are more items
  const nextCursorValue = endIndex < filteredResults.length ? endIndex.toString() : null;
  
  return {
    results: paginatedResults,
    nextCursor: nextCursorValue,
    totalCount: filteredResults.length
  };
};

// Header Component (without the query client provider)
const HeaderContent = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { ref: loadMoreRef, inView } = useInView();
  const user = useUser();
  
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Check if current route should show search
  const shouldShowSearch = SEARCHABLE_ROUTES.some((route) =>
    pathname?.startsWith(route) || false
  );

  // Handle keyboard shortcut to open search
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

  // Search query with React Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['searchResults', debouncedQuery],
    queryFn: ({ pageParam }) => fetchSearchResults({
      query: debouncedQuery,
      cursor: pageParam as string | null,
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: debouncedQuery.length > 0 && commandOpen,
  });

  // Flatten all pages of results
  const allResults = React.useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.results);
  }, [data]);

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle selecting a search result
  const handleSelectSearchResult = useCallback((path: string) => {
    setCommandOpen(false);
    setSearchQuery("");
    router.push(path);
  }, [router]);

  // Handle closing the command dialog
  const handleCommandClose = useCallback(() => {
    setCommandOpen(false);
    setSearchQuery("");
  }, []);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full mx-auto px-2">
          <div className="flex justify-between items-center h-16">
            {/* Left section - Logo */}
            <div className="flex items-center lg:pl-0 pl-10">
              <Link href="/" className="flex-shrink-0">
                <div className="h-8 w-auto font-bold text-xl flex items-center">
                  <span className="text-green-950 px-2 py-1 rounded">
                    M&AI
                  </span>
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
                  <Button variant="ghost" className="flex items-center gap-2 px-2 h-10">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
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
                        <p className="text-xs text-muted-foreground">{result.description}</p>
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

// Wrap the header in the UserProvider when exporting
export default function HeaderWithUserContext() {
  return (
    <UserProvider>
      <Header />
    </UserProvider>
  );
}