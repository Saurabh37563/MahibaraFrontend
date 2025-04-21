"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage, addUserMessage } from "@/redux/features/chatSlice";

export default function ChatInput() {
  const [input, setInput] = useState("");
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.chat);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message to state
    dispatch(addUserMessage(input));

    // Send message to API
    dispatch(sendMessage(input));

    // Clear input
    setInput("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            className="w-full p-3 pr-12 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 min-h-[60px] max-h-[200px]"
            placeholder="Message ChatAI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={loading}
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className={`absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 ${
              !input.trim() || loading
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer"
            }`}
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
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          ChatAI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
