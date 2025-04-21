import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { FaRegBell, FaChevronDown } from "react-icons/fa";
import { useInView } from "react-intersection-observer";

const NotificationsDropdown = ({ 
  notifications, 
  showNotifications, 
  setShowNotifications, 
  notificationDropdownRef,
  hasMoreNotifications = false,
  loadMoreNotifications,
  markAsRead,
  markAllAsRead,
  isLoading = false
}) => {
  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
  });

  // Load more notifications when the bottom element comes into view
  React.useEffect(() => {
    if (inView && hasMoreNotifications && !isLoading) {
      loadMoreNotifications();
    }
  }, [inView, hasMoreNotifications, loadMoreNotifications, isLoading]);

  // Handle click on notification item
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Navigate or call appropriate API based on notification type
  };

  return (
    <div className="relative" ref={notificationDropdownRef}>
      {/* Keep the trigger button exactly the same as per your request */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-1 rounded-full text-gray-500 hover:text-green-700 focus:outline-none"
      >
        <FaRegBell className="text-green-900" size={25} />
        <span className="absolute top-[-5px] right-[-4px] h-4 w-4 rounded-full bg-green-800 text-xs text-white flex items-center justify-center">
          {notifications.filter((n) => !n.read).length}
        </span>
      </button>

      {/* Enhanced Notifications dropdown */}
      {showNotifications && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 md:w-96 rounded-md shadow-lg bg-white ring-1 ring-gray-100 ring-opacity-5 z-50 focus:outline-none">
          <div className="py-1 divide-y divide-gray-100">
            <div className="px-4 py-2 flex justify-between items-center ">
              <h3 className="text-sm font-medium text-green-900">Notifications</h3>
              <button 
                className="text-xs text-green-700 hover:text-green-800 disabled:opacity-50"
                onClick={markAllAsRead}
                disabled={!notifications.some(n => !n.read)}
              >
                Mark all as read
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-transparent">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-sm text-center text-gray-500">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p>Loading notifications...</p>
                    </div>
                  ) : (
                    <p>No notifications</p>
                  )}
                </div>
              ) : (
                <>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors duration-150 ${
                        !notification.read ? "bg-green-50" : ""
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              !notification.read 
                                ? "bg-green-100 text-green-700" 
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            <FaRegBell size={16} />
                          </div>
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <p className={`text-sm ${!notification.read ? "font-medium" : ""} text-gray-900`}>
                            {notification.text}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Infinite scroll loading indicator */}
                  <div 
                    ref={loadMoreRef} 
                    className="py-3 text-center text-xs text-gray-500"
                  >
                    {isLoading && (
                      <div className="flex justify-center items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading more...</span>
                      </div>
                    )}
                    {!hasMoreNotifications && notifications.length > 0 && (
                      <span>No more notifications</span>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div className="px-4 py-2 text-center ">
              <Link
                href="/notifications"
                className="text-sm text-green-700 hover:text-green-800 flex items-center justify-center"
              >
                <span>View all notifications</span>
                <FaChevronDown className="ml-1 rotate-270 transform" size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;