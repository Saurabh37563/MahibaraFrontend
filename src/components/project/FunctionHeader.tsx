"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiHome } from "react-icons/fi";
import { HiOutlineChevronRight } from "react-icons/hi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatargroup";
import { useTeamContext } from "@/contexts/team-context";
import {
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown, HelpCircle, LogOut, User } from "lucide-react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useAuth } from "@/contexts/auth-context";

export default function FunctionHeader({
  selectedItem = null,
}: {
  selectedItem?: any;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token }: any = useAuth();
  const orgName = searchParams.get("orgName") || "Unknown Org";
  const functionName = searchParams.get("projectName") || "Unknown Function";

  const { activeTeam } = useTeamContext();

  const getUserInitials = () => {
    if (!user || !user.name) return "U";

    return user.name
      .split(" ")
      .map((n: any) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="py-3 px-4 flex items-center justify-between border-b">
      {/* Left section: Home icon and breadcrumb */}
      <div className="flex items-center">
        <Link href="/functions" className="text-gray-500 hover:text-gray-700">
          <FiHome size={18} />
        </Link>

        {selectedItem && (
          <div className="flex items-center ml-2">
            <HiOutlineChevronRight className="text-gray-400 mx-1" size={14} />
            <span className="text-sm text-gray-600">{selectedItem?.name}</span>
          </div>
        )}
      </div>

      {/* Middle section: Org name / Function name */}
      <div className="text-sm h-fit font-medium flex gap-1 items-center">
        <span>{orgName}</span>
        <span>/</span>
        <span className="text-gray-600">{functionName}</span>
      </div>

      {/* Right section: Avatar group */}
      <div className="flex items-center gap-2">
        <AvatarGroup className=" text-xs" max={2} spacing={-1} size="sm">
          {activeTeam?.members?.map((member: any) => (
            <Avatar key={member.id}>
              <AvatarImage
                src={member?.image || ""}
                alt={member.name}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <AvatarFallback>
                {member.name
                  .split(" ")
                  .map((n: any) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center border border-gray-100 gap-2 px-2 h-10"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} alt={user?.name || "User"} />
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
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            {/* <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => router.push("/help-and-support")}>
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
  );
}
