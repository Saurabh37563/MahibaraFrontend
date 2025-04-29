"use client"

import Link from "next/link"
import { FiHome, FiShare2, FiUser } from "react-icons/fi"
import { HiOutlineChevronRight } from "react-icons/hi"
import { FiSettings } from "react-icons/fi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { BsGear } from "react-icons/bs";
import { MdHelpOutline } from "react-icons/md";
import { MdOutlineLogout } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

// You'll need to create this component or install from shadcn
// I've included the implementation at the end of this code
import { AvatarGroup } from "@/components/ui/avatargroup" 
import { FaUser } from "react-icons/fa"

export default function FunctionHeader({ 
  selectedItem = null, 
  orgName = "Acme Corp", 
  functionName = "Procurement"
}:any) {
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

      {/* Right section: Share, Avatar group, Settings menu */}
      <div className="flex items-center gap-2">
        {/* Share button */}
        {/* <Button variant="ghost" size="icon" className="text-green-800 w-fit h-fit px-2 py-2 text-xs bg-green-600/10 flex items-center ">
          <FiShare2 size={12} /> Share
        </Button> */}
        
        {/* Avatar group */}
        <AvatarGroup className="text-xs">
          <Avatar>
            <AvatarImage src="/avatars/01.png" alt="User 1" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="/avatars/02.png" alt="User 2" />
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="/avatars/03.png" alt="User 3" />
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarImage src="/avatars/04.png" alt="User 4" />
            <AvatarFallback>EF</AvatarFallback>
          </Avatar>
        </AvatarGroup>
        
      
      </div>
    </div>
  )
}