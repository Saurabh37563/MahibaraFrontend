"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  createNewConversation,
  setCurrentConversation,
} from "@/redux/features/chatSlice";
import { toggleSidebar } from "@/redux/features/uiSlice";
import Button from "@/components/ui/Button";

export default function Sidebar() {
  const dispatch = useDispatch();
  const { conversations, currentConversationId } = useSelector(
    (state) => state.chat,
  );
  const { sidebarOpen } = useSelector((state) => state.ui);

  const handleNewChat = () => {
    dispatch(createNewConversation());
  };

  return (
    <aside
      className={`bg-gray-900 text-white h-screen flex flex-col transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-0 md:w-16"
      } overflow-hidden`}
    >
      <div className="p-4">
        <Button
          onClick={handleNewChat}
          className="w-full border border-white/20 rounded-md py-2 flex items-center justify-center gap-3 hover:bg-gray-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          {sidebarOpen && <span>New chat</span>}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => dispatch(setCurrentConversation(conv.id))}
            className={`px-3 py-2 rounded-md mb-1 cursor-pointer flex items-center ${
              currentConversationId === conv.id
                ? "bg-gray-700"
                : "hover:bg-gray-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            {sidebarOpen && (
              <span className="truncate text-sm">{conv.title}</span>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-white/20 p-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-gray-700 w-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
          {sidebarOpen && <span>Hide sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
