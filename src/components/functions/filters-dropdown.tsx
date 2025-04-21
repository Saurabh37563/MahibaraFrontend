"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

interface FilterDropdownProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export default function FilterDropdown({
  label,
  options,
  selected,
  onSelect,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-48">
      <div
        className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white hover:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm text-gray-700">{selected || label}</span>
        <FiChevronDown className="text-gray-500" />
      </div>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-sm">
          {options.map((option) => (
            <div
              key={option}
              className="px-3 py-2 hover:bg-green-50 text-sm text-gray-700 cursor-pointer"
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
