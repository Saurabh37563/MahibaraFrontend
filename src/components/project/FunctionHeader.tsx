"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiHome } from "react-icons/fi";
import { HiOutlineChevronRight } from "react-icons/hi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatargroup";
import { useTeamContext } from "@/contexts/team-context";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown, HelpCircle, LogOut, User } from "lucide-react";
import { DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

export default function FunctionHeader({
  selectedItem = null,
}: {
  selectedItem?: { name?: string } | null;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { activeOrg, activeTeam, projectName } = useTeamContext();

  // Type-safe access to user data including firstName/lastName
  const user = session?.user
    ? {
        name:
          session.user.firstName && session.user.lastName
            ? `${session.user.firstName} ${session.user.lastName}`
            : session.user.name || "User",
        email: session.user.email || undefined,
        image: session.user.image || undefined,
      }
    : null;

  const orgName = activeOrg?.name || null;
  const functionName = projectName || null;

  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    return user.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  // Accent backgrounds for avatars (background only, not text)
  const avatarAccentBgClasses = [
    "bg-emerald-100",
    "bg-blue-100",
    "bg-orange-100",
  ];
  // Accent backgrounds for avatars (background only, not text)
  const avatarAccentTextClasses = [
    "text-emerald-700",
    "text-blue-700",
    "text-orange-700",
  ];
  // Helper to render avatars with accent color for fallback
  const renderTeamAvatars = () => {
    if (!activeTeam?.members || activeTeam.members.length === 0) {
      return (
        <div className="flex gap-1">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </div>
      );
    }

    // Show at most 2 avatars, rest as overflow
    const avatars = activeTeam.members.slice(0, 2).map((member, idx) => {
      const memberId = String(member.id);
      const memberName = member.name ?? "U";
      const accentBgClass =
        avatarAccentBgClasses[idx % avatarAccentBgClasses.length];
      const accentTextClass =
        avatarAccentTextClasses[idx % avatarAccentTextClasses.length];
      return (
        <Avatar
          key={memberId}
          className="border-2 border-white text-xs p-0 shadow-none"
        >
          <AvatarImage
            src={member?.image || ""}
            alt={memberName}
            className="object-cover"
            onError={(e) =>
              ((e.currentTarget as HTMLImageElement).style.display = "none")
            }
          />
          <AvatarFallback
            className={`${accentBgClass} ${accentTextClass} text-[10px] font-semibold p-0`}
          >
            {memberName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    });
    const overflowCount = activeTeam.members.length - 2;
    const overflowBgClass =
      avatarAccentBgClasses[avatarAccentBgClasses.length - 1];
    const overflowTextClass =
      avatarAccentTextClasses[avatarAccentTextClasses.length - 1];
    return (
      <AvatarGroup max={2} spacing={-2} size="sm">
        {avatars}
        {overflowCount > 0 && (
          <Avatar className={` border-2 border-white text-xs p-0 `}>
            <AvatarFallback
              className={`${overflowBgClass} ${overflowTextClass} text-[10px] font-semibold p-0`}
            >
              +{overflowCount}
            </AvatarFallback>
          </Avatar>
        )}
      </AvatarGroup>
    );
  };

  return (
    <div className="py-3 px-2 sm:px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b w-full">
      {/* Left section: Home icon and breadcrumb */}
      <div className="flex items-center min-w-0">
        <Link
          href="/functions"
          className="text-gray-500 hover:text-gray-700 flex-shrink-0"
        >
          <FiHome size={18} />
        </Link>
        {selectedItem && (
          <div className="flex items-center ml-2 min-w-0">
            <HiOutlineChevronRight
              className="text-gray-400 mx-1 flex-shrink-0"
              size={14}
            />
            <span className="text-sm text-gray-600 truncate max-w-[120px] sm:max-w-[180px]">
              {selectedItem?.name}
            </span>
          </div>
        )}
      </div>
      {/* Middle section: Org name / Function name */}
      <div className="flex-1 flex justify-center min-w-0">
        <div className="text-sm h-fit font-medium flex gap-1 items-center min-w-0 max-w-full">
          {orgName ? (
            <span
              className="truncate max-w-[90px] sm:max-w-[140px]"
              title={orgName}
            >
              {orgName}
            </span>
          ) : (
            <Skeleton className="h-5 w-24 rounded" />
          )}
          <span>/</span>
          {functionName ? (
            <span
              className="text-gray-600 truncate max-w-[90px] sm:max-w-[140px]"
              title={functionName}
            >
              {functionName}
            </span>
          ) : (
            <Skeleton className="h-5 w-20 rounded" />
          )}
        </div>
      </div>
      {/* Right section with fixed user display */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {renderTeamAvatars()}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center hover:bg-slate-100  bg-slate-50 gap-2 p-2 h-10"
              disabled={!user}
              aria-label="Open user menu"
            >
              {user ? (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-emerald-800/20 text-emerald-800">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </>
              ) : (
                <Skeleton className="h-8 w-8 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-72 max-w-xs p-0 overflow-hidden shadow-lg"
          >
            {user ? (
              <>
                {/* Profile Card with fixed name display */}
                <div className="flex flex-col items-center px-4 py-4 bg-gradient-to-b from-slate-50 to-white border-b border-gray-100">
                  <Avatar className="h-14 w-14 mb-2">
                    <AvatarImage
                      src={user?.image || undefined}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="text-lg">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-base text-gray-900 text-center w-full truncate">
                    {user?.name || "User"}
                  </span>
                  <span
                    className="text-xs text-gray-500 text-center w-full max-w-[200px] truncate"
                    title={user?.email || ""}
                  >
                    {user?.email || ""}
                  </span>
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
                  onClick={() => {
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="flex items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <div className="p-4 flex flex-col gap-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
