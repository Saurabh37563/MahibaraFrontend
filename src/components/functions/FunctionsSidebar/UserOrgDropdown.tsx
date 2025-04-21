// components/ui/Dropdown.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

interface DropdownProps {
  trigger: React.ReactNode;
  items: {
    customRender?: React.ReactNode;
    label?: string;
    onClick?: () => void;
  }[];
  align?: "left" | "right";
  width?: string;
  className?: string;
}

const UserOrgDropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = "left",
  width = "w-48",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleItemClick = (item: any) => {
    if (typeof item.onClick === 'function') {
      item.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
    
      <div className="px-2" onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`absolute z-10 mt-2 ${width} rounded-md shadow-lg bg-white focus:outline-none ${
            align === "left" ? "origin-top-left left-0" : "origin-top-right right-0"
          }`}
        >
          <div className="">
            {items.map((item, index) => (
              <div key={index} onClick={() => handleItemClick(item)}>
                {item.customRender ? (
                  item.customRender
                ) : (
                  <div className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrgDropdown;