"use client";

import { useState, useRef, useEffect } from "react";
import useOutsideClick from "@/hooks/useOutsideClick";

export default function Dropdown({
  trigger,
  items,
  align = "right",
  width = "w-48",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  // Close dropdown when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 transform -translate-x-1/2",
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
    >
      <div onClick={toggleDropdown} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-10 mt-2 ${width} ${alignmentClasses[align]} rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {items.map((item, index) => (
              <div key={index}>
                {item.divider ? (
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                ) : (
                  <div
                    className={`${
                      item.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    } px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                    onClick={() => {
                      if (!item.disabled) {
                        item.onClick();
                        setIsOpen(false);
                      }
                    }}
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.label}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
