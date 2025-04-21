"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaSearch,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaQuestionCircle,
  FaChevronDown,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import NotificationsDropdown from "./NotificationsDropdown";

// Routes that should display the search bar
const SEARCHABLE_ROUTES = [
  "/dashboard",
  "/users",
  "/projects",
  "/analytics",
  "/reports",
  "/settings/general",
];

const Header = () => {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const userDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Check if current route should show search
  const shouldShowSearch = SEARCHABLE_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sample notifications
  const notifications = [
    { id: 1, text: "New comment on your post", time: "2 min ago", read: false },
    {
      id: 2,
      text: "Your project was approved",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      text: "Meeting scheduled for tomorrow",
      time: "5 hours ago",
      read: true,
    },
    { id: 4, text: "System update completed", time: "Yesterday", read: true },
    { id: 5, text: "New comment on your post", time: "2 min ago", read: false },
    {
      id: 6,
      text: "Your project was approved",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 7,
      text: "Meeting scheduled for tomorrow",
      time: "5 hours ago",
      read: true,
    },
    { id: 8, text: "System update completed", time: "Yesterday", read: true },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="h-8 w-8 relative">
                  {/* Replace with your actual logo */}
                  <div className="h-8 w-auto font-bold text-xl flex items-center">
                    <span className="text-green-950 px-2 py-1 rounded">
                      M&AI
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="ml-4 md:hidden">
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {mobileMenu ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>

          {/* Middle section - Search Bar (conditionally rendered) */}
          {shouldShowSearch && (
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {/* Right section - Notifications & User Profile */}
          <div className="flex items-center space-x-4">
            {/* Search toggle for mobile */}
            {shouldShowSearch && (
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="md:hidden text-gray-500 hover:text-gray-700"
              >
                <FaSearch size={20} />
              </button>
            )}

            {/* Notifications Component */}
            <NotificationsDropdown
              notifications={notifications}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              notificationDropdownRef={notificationDropdownRef}
            />

            {/* User avatar dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {/* Replace with user's avatar */}
                  <FaUser size={18} className="text-gray-500" />
                </div>
                <FaChevronDown size={12} className="text-gray-500" />
              </button>

              {/* User dropdown */}
              {showUserDropdown && (
                <div className="origin-top-right border border-gray-200 absolute right-0  w-48 rounded-md shadow-lg bg-white ">
                  <div className="">
                    <Link
                      href="/profile"
                      className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FaUser size={14} className="mr-2" />
                      Your Profile
                    </Link>

                    <Link
                      href="/settings"
                      className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FaCog size={14} className="mr-2" />
                      Settings
                    </Link>

                    <Link
                      href="/help"
                      className=" px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <FaQuestionCircle size={14} className="mr-2" />
                      Help & Support
                    </Link>

                    <button
                      className="w-full text-left  px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      onClick={() => console.log("Sign out")}
                    >
                      <FaSignOutAlt size={14} className="mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search - conditionally shown */}
      {shouldShowSearch && showSearch && (
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>
      )}

      {/* Mobile menu (expanded) */}
      {mobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2 px-4">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="block py-2 px-3 rounded-md text-base font-medium text-gray-900 hover:bg-green-50"
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className="block py-2 px-3 rounded-md text-base font-medium text-gray-900 hover:bg-green-50"
            >
              Projects
            </Link>
            <Link
              href="/analytics"
              className="block py-2 px-3 rounded-md text-base font-medium text-gray-900 hover:bg-green-50"
            >
              Analytics
            </Link>
            <Link
              href="/reports"
              className="block py-2 px-3 rounded-md text-base font-medium text-gray-900 hover:bg-green-50"
            >
              Reports
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
