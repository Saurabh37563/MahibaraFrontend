// components/Sidebar/Sidebar.tsx
'use client'
import UserOrgDropdown from "./UserOrgDropdown";
import SidebarItem from "./SidebarItem";
import { Avatar } from "@/components/ui/avatar";
import { FiChevronDown } from "react-icons/fi";
import { GoGear } from "react-icons/go";
import { FiUserPlus } from "react-icons/fi";
import { AiOutlineFunction } from "react-icons/ai";
import { IoMdAdd } from "react-icons/io";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
const sidebarItems = [
  { name: "Project Alpha" },
  { name: "Project Beta" },
  { name: "Project Gamma" },
];

export default function Sidebar() {
  // Create dropdown items for organizations
  const dropdownItems = [
    {
      customRender: (
        <div className="flex items-center justify-between hover:bg-gray-50  px-2 py-2 rounded cursor-pointer">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={undefined} alt="imagedwq" />
              <AvatarFallback>IM</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-800">Acme Inc</span>
          </div>
          <div className="flex items-center text-gray-500 gap-2">
            <FiUserPlus
              className="hover:text-gray-700 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                alert("Edit Acme");
              }}
            />
            <GoGear
              className="hover:text-gray-700 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                alert("Delete Acme");
              }}
            />
          </div>
        </div>
      ),
    },
    {
      customRender: (
        <div className="flex items-center justify-between hover:bg-gray-50 px-2 py-2 rounded cursor-pointer">
          <div className="flex items-center gap-2">
          <Avatar>
              <AvatarImage src={undefined} alt="imagedwq" />
              <AvatarFallback>IM</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-800">Beta Corp</span>
          </div>
          <div className="flex items-center text-gray-500 gap-2 ">
            <FiUserPlus
              className="hover:text-gray-700 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                alert("Edit Beta");
              }}
            />
            <GoGear
              className="hover:text-gray-700 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                alert("Delete Beta");
              }}
            />
          </div>
        </div>
      ),
    },
  ];

  // Create dropdown trigger
  const dropdownTrigger = (
    <div className="flex items-center gap-2 cursor-pointer">
       <Avatar>
              <AvatarImage src={undefined} alt="imagedwq" />
              <AvatarFallback>IM</AvatarFallback>
            </Avatar>
      <span className="font-semibold text-gray-900">Acme Inc</span>
      <FiChevronDown size={18} className="text-gray-400" />
    </div>
  );

  return (
    <aside className="w-64 sticky h-screen border-r border-r-gray-200 bg-white flex flex-col shadow-md">
      <div className="p-4 border-b border-gray-200">
        <UserOrgDropdown 
          items={dropdownItems} 
          trigger={dropdownTrigger}
          width="w-44 border border-gray-200"
          align="left"
        />
      </div>
      <div className="overflow-auto p-2 space-y-1"> 
        <div className="flex justify-between gap-2 rounded-md">
          <div className="flex items-center gap-2">
            <AiOutlineFunction size={22} />
            <span className="text-sm font-semibold text-gray-800">Functions</span>
          </div>
          
          <button className="p-2 hover:bg-gray-100 cursor-pointer">
            <IoMdAdd size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {sidebarItems.map((item, idx) => (
          <SidebarItem
            key={idx}
            name={item.name}
            onEdit={() => alert(`Edit ${item.name}`)}
            onDelete={() => alert(`Delete ${item.name}`)}
          />
        ))}
      </div>
    </aside>
  );
}