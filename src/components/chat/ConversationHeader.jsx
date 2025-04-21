"use client";

import { useSelector } from "react-redux";

export default function ConversationHeader() {
  const { conversations, currentConversationId } = useSelector(
    (state) => state.chat,
  );
  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId,
  );

  return (
    <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 hidden md:block">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <h2 className="font-medium text-gray-900 dark:text-gray-100 truncate">
          {currentConversation?.title || "New Conversation"}
        </h2>
      </div>
    </div>
  );
}
