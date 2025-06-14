"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { ChevronDown, LogOut, HelpCircle, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useSession } from "next-auth/react";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { FiSidebar } from "react-icons/fi";
import { fetchSearchResults } from "@/services/search-service";
import { useDebounce } from "@/hooks/use-debounce";
import {
  AuthUser,
  SidebarContextType,
  HeaderProps,
  SearchResponse,
} from "@/types/header-types";
import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";

type QueryKey = readonly ["searchResults", string];

export const Header: React.FC<HeaderProps> = ({}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { ref: loadMoreRef, inView } = useInView();
  const { data: session } = useSession();
  const sidebarContext = useSidebar();
  const { isOpen = false, isMobile = false } = (sidebarContext ||
    {}) as SidebarContextType;
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 300);

  const user = session?.user as AuthUser | undefined;

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user.name[0].toUpperCase();
  };

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
    queryKey: ["searchResults", debouncedQuery] as QueryKey,
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      return fetchSearchResults({
        query: debouncedQuery,
        cursor: pageParam,
      });
    },
    initialPageParam: null,
    getNextPageParam: (lastPage: SearchResponse) => lastPage.nextCursor,
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

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full mx-auto px-2">
          <div className="relative flex items-center h-16">
            {/* Left section - Logo */}
            <div className="flex items-center flex-shrink-0 absolute left-0 top-1/2 -translate-y-1/2">
              {isMobile && !isOpen && pathname === "/functions" && (
                <SidebarTrigger className="size-10">
                  <FiSidebar size={40} />
                </SidebarTrigger>
              )}
              <Link href="/" className="flex-shrink-0">
                <Image width={30} height={30} src={"/mab.svg"} alt="logo" />
              </Link>
            </div>

            <div className="flex items-center absolute right-0 top-1/2 -translate-y-1/2 space-x-2 md:space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 h-10"
                    aria-label="Open user menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.image}
                        alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
                      />
                      <AvatarFallback className="bg-emerald-800/20 text-emerald-800">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-0 overflow-hidden shadow-lg"
                >
                  {/* Profile Card */}
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-b from-slate-50 to-white border-b border-gray-100">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={user?.image}
                        alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
                      />
                      <AvatarFallback className="text-base">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {user
                          ? `${user.firstName || ""} ${user.lastName || ""}`
                          : "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="flex items-center gap-2 focus:bg-emerald-50 focus:text-emerald-900"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/help-and-support")}
                    className="flex items-center gap-2 focus:bg-emerald-50 focus:text-emerald-900"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      signOut({ callbackUrl: "/login" });
                    }}
                    className="flex items-center gap-2  focus:bg-red-50 focus:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
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
