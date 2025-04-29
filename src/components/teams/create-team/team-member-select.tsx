"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useInView } from "react-intersection-observer"
import { z } from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@radix-ui/react-scroll-area"

// Zod schema for team member validation
const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  position: z.string(),
  avatarUrl: z.string().nullable().optional(),
})

// Zod schema for team member with permission
const TeamMemberWithPermissionSchema = TeamMemberSchema.extend({
  permission: z.enum(["view", "edit"]),
})

// TypeScript types derived from zod schemas
type TeamMemberType = z.infer<typeof TeamMemberSchema>
type TeamMemberWithPermissionType = z.infer<typeof TeamMemberWithPermissionSchema>

// API response schema
const ApiResponseSchema = z.object({
  members: z.array(TeamMemberSchema),
  nextCursor: z.string().nullable().optional(),
  totalCount: z.number(),
})

type ApiResponse = z.infer<typeof ApiResponseSchema>

interface TeamMemberSelectorProps {
  selectedMembers: TeamMemberWithPermissionType[]
  onMembersChange: (members: TeamMemberWithPermissionType[]) => void
}

// Function to fetch team members from API
const fetchTeamMembers = async ({
  search = "",
  cursor = null,
  limit = 10,
  excludeIds = [],
}: {
  search?: string
  cursor?: string | null
  limit?: number
  excludeIds?: string[]
}): Promise<ApiResponse> => {
  try {
    // In a real implementation, this would be an actual API call
    // const response = await fetch(
    //   `/api/team-members?search=${search}&cursor=${cursor}&limit=${limit}&exclude=${excludeIds.join(",")}`
    // )
    // const data = await response.json()
    // return ApiResponseSchema.parse(data)

    // Mock implementation for demonstration
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock data
    const allMembers = [
      { id: "1", name: "John Doe", email: "john@example.com", position: "Frontend Developer", avatarUrl: "https://github.com/shadcn.png" },
      { id: "2", name: "Jane Smith", email: "jane@example.com", position: "Backend Developer", avatarUrl: "https://github.com/shadcn.png" },
      { id: "3", name: "Alex Johnson", email: "alex@example.com", position: "UI/UX Designer", avatarUrl: "" },
      { id: "4", name: "Sarah Williams", email: "sarah@example.com", position: "Project Manager", avatarUrl: "" },
      { id: "5", name: "Michael Brown", email: "michael@example.com", position: "DevOps Engineer", avatarUrl: "" },
      { id: "6", name: "Emma Wilson", email: "emma@example.com", position: "Product Manager", avatarUrl: "" },
      { id: "7", name: "David Lee", email: "david@example.com", position: "QA Engineer", avatarUrl: "" },
      { id: "8", name: "Olivia Davis", email: "olivia@example.com", position: "Data Scientist", avatarUrl: "" },
      { id: "9", name: "James Taylor", email: "james@example.com", position: "System Administrator", avatarUrl: "" },
      { id: "10", name: "Sophia Martinez", email: "sophia@example.com", position: "Marketing Specialist", avatarUrl: "" },
      { id: "11", name: "Benjamin Clark", email: "ben@example.com", position: "Mobile Developer", avatarUrl: "" },
      { id: "12", name: "Ava Rodriguez", email: "ava@example.com", position: "CTO", avatarUrl: "" },
      { id: "13", name: "William Lopez", email: "will@example.com", position: "CEO", avatarUrl: "" },
      { id: "14", name: "Mia Gonzalez", email: "mia@example.com", position: "CFO", avatarUrl: "" },
      { id: "15", name: "Ethan Adams", email: "ethan@example.com", position: "COO", avatarUrl: "" },
      { id: "16", name: "Isabella Torres", email: "isabella@example.com", position: "HR Manager", avatarUrl: "" },
      { id: "17", name: "Noah Robinson", email: "noah@example.com", position: "Sales Executive", avatarUrl: "" },
      { id: "18", name: "Charlotte Scott", email: "charlotte@example.com", position: "Marketing Manager", avatarUrl: "" },
      { id: "19", name: "Lucas Garcia", email: "lucas@example.com", position: "Security Engineer", avatarUrl: "" },
      { id: "20", name: "Amelia Lewis", email: "amelia@example.com", position: "Content Strategist", avatarUrl: "" },
    ]

    // Filter based on search and exclude IDs
    const filteredMembers = allMembers
      .filter(member => 
        !excludeIds.includes(member.id) && 
        (search === "" || 
         member.name.toLowerCase().includes(search.toLowerCase()) ||
         member.email.toLowerCase().includes(search.toLowerCase()) ||
         member.position.toLowerCase().includes(search.toLowerCase()))
      )

    // Get starting index from cursor
    const startIndex = cursor ? parseInt(cursor) : 0
    const endIndex = startIndex + limit
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex)
    
    // Determine if there are more items
    const nextCursorValue = endIndex < filteredMembers.length ? endIndex.toString() : null

    return {
      members: paginatedMembers,
      nextCursor: nextCursorValue,
      totalCount: filteredMembers.length,
    }
  } catch (error) {
    console.error("Error fetching team members:", error)
    throw error
  }
}

export function TeamMemberSelector({ selectedMembers, onMembersChange }: TeamMemberSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const { ref: loadMoreRef, inView } = useInView()
  const [isMobile, setIsMobile] = React.useState(false)

  // Check for mobile viewport on mount and when window resizes
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    // Initial check
    checkIsMobile()
    
    // Listen for window resize
    window.addEventListener('resize', checkIsMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Debounce the search input
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [search])

  // Get IDs of already selected members
  const excludeIds = React.useMemo(() => 
    selectedMembers.map(member => member.id), 
    [selectedMembers]
  )

  // Fetch team members with infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['teamMembers', debouncedSearch, excludeIds],
    queryFn: ({ queryKey, pageParam, signal }:any) => {
      const [_key, search, excludeIds] = queryKey
  
      return fetchTeamMembers({
        search: search as string,
        cursor: pageParam as string | null,
        limit: 10,
        excludeIds: excludeIds as string[],
      })
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
  
  

  // Load more when scrolling to bottom
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Reset search when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearch("")
    }
  }, [open])

  // Update query when the component mounts or selected members change
  React.useEffect(() => {
    if (open) {
      refetch()
    }
  }, [open, excludeIds, refetch])

  // Flatten all pages of results
  const allMembers = React.useMemo(() => {
    if (!data) return []
    return data.pages.flatMap((page:any) => page.members)
  }, [data])

  // Handle member selection
  const handleSelectMember = (member: TeamMemberType) => {
    try {
      // Validate member data with zod
      const validatedMember = TeamMemberSchema.parse(member)
      
      // Add the member with default 'view' permission
      const memberWithPermission: TeamMemberWithPermissionType = {
        ...validatedMember,
        permission: 'view'
      }
      
      onMembersChange([...selectedMembers, memberWithPermission])
      setOpen(false)
      setSearch("")
    } catch (error) {
      console.error("Invalid member data:", error)
    }
  }

  // Handle member removal
  const handleRemoveMember = (id: string) => {
    onMembersChange(selectedMembers.filter(member => member.id !== id))
  }

  // Handle permission change
  const handlePermissionChange = (id: string, permission: 'view' | 'edit') => {
    onMembersChange(
      selectedMembers.map(member => 
        member.id === id ? { ...member, permission } : member
      )
    )
  }

  return (
    <div className="space-y-4 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            type="button"
          >
            <span className="text-left font-normal truncate">
              {search || "Search team members..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[var(--radix-popover-trigger-width)]" 
          align="start"
          sideOffset={4}
          side={"top"}
          avoidCollisions={!isMobile}
        >
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search team members..." 
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <ScrollArea className="sm:max-h-[300px] max-h-[40vh]">
            <CommandList >
              {isLoading && !allMembers.length ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading team members...</span>
                </div>
              ) : isError ? (
                <div className="py-6 text-center text-sm text-destructive">
                  Failed to load team members. Please try again.
                </div>
              ) : allMembers.length === 0 ? (
                <CommandEmpty>
                  {debouncedSearch
                    ? "No matching team members found"
                    : "Type to search for team members"}
                </CommandEmpty>
              ) : (
                <>
                  <CommandGroup heading="Team Members">
                    {allMembers.map((member) => (
                      <CommandItem
                        key={member.id}
                        onSelect={() => handleSelectMember(member)}
                        className="flex items-center gap-2 py-2"
                        value={`${member.name} ${member.email} ${member.position}`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={member.avatarUrl || "/placeholder-avatar.svg"} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .slice(0, 2)
                              .map((n:any) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col truncate">
                          <span className="font-medium">{member.name}</span>
                          <div className="flex flex-col sm:flex-row text-xs text-muted-foreground">
                            <span className="truncate">{member.email}</span>
                            <span className="hidden sm:inline mx-1 flex-shrink-0">•</span>
                            <span className="truncate">{member.position}</span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  
                  {/* Load more indicator */}
                  {(hasNextPage || isFetchingNextPage) && (
                    <div 
                      ref={loadMoreRef} 
                      className="py-2 text-center text-sm text-muted-foreground"
                    >
                      {isFetchingNextPage ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          <span>Loading more...</span>
                        </div>
                      ) : (
                        "Scroll for more"
                      )}
                    </div>
                  )}
                </>
              )}
            </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected members list */}
      {selectedMembers.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Selected members ({selectedMembers.length})</p>
            {selectedMembers.length > 1 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onMembersChange([])}
                className="h-8 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          <div className="space-y-2 max-h-[40vh] sm:max-h-[300px] overflow-y-auto">
            {selectedMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-2 hover:bg-muted/40 transition-colors gap-2"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={member.avatarUrl || "/placeholder-avatar.svg"} alt={member.name} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium truncate">{member.name}</span>
                    <div className="flex flex-col sm:flex-row text-xs text-muted-foreground">
                      <span className="truncate">{member.email}</span>
                      <span className="hidden sm:inline mx-1 flex-shrink-0">•</span>
                      <span className="truncate">{member.position}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 mt-2 sm:mt-0">
                  <Select 
                    value={member.permission} 
                    onValueChange={(value) => handlePermissionChange(member.id, value as 'view' | 'edit')}
                  >
                    <SelectTrigger className="flex-grow sm:flex-grow-0 sm:w-24 h-8">
                      <SelectValue placeholder="Permission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8" 
                    onClick={() => handleRemoveMember(member.id)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove {member.name}</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}