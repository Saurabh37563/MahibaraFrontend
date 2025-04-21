"use client";

import { useDispatch } from "react-redux";
import { toggleSidebar } from "@/redux/features/uiSlice";

export default function MobileNav() {
  const dispatch = useDispatch();

  return (
    <div className="md:hidden bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-3">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="p-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
    </div>
  );
}
