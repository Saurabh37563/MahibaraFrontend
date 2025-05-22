// User search component
import { useSearchUsers } from "@/queries/organization-query";
import { User } from "@/services/api/organization-api"
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
export default function UserSearch({ 
  onUserSelect, 
  selectedUser 
}: { 
  onUserSelect: (user: User | null) => void;
  selectedUser: {
    id: string;
    name: string;
    email: string;
    position: string;
    avatarUrl: string | null;
  } | null;
}) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const { data: users = [], isLoading } = useSearchUsers(searchQuery)

  // Get initials from user name for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedUser ? selectedUser.name : "Select organization head..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        align="start" 
        style={{ width: "var(--radix-popover-trigger-width)" }}
      >
        <div className="border rounded-md overflow-hidden">
          <div className="px-3  border-b">
            <input
              className="w-full bg-transparent outline-none border-none text-sm placeholder:text-muted-foreground"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="max-h-[200px] overflow-y-auto py-1">
            {isLoading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Searching...</span>
              </div>
            )}
            
            {!isLoading && users.length === 0 && searchQuery.length >= 2 && (
              <div className="p-2 text-sm text-muted-foreground">
                No users found matching "{searchQuery}"
              </div>
            )}
            
            {!isLoading && users.length > 0 && (
              <>
                <div className="py-1">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent cursor-pointer"
                      onClick={() => {
                        onUserSelect(user);
                        setOpen(false);
                      }}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                      {selectedUser?.id === user.id && (
                        <Check className="h-4 w-4" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}