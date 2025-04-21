"use client";

import { useSelector } from "react-redux";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import ConversationHeader from "./ConversationHeader";

export default function ChatContainer() {
  const { currentConversationId, messages } = useSelector(
    (state) => state.chat,
  );

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {currentConversationId ? (
        <>
          <ConversationHeader />
          <MessageList messages={messages} />
          <ChatInput />
        </>
      ) : (
        <div className="flex items-center justify-center h-full flex-col p-4 text-center">
          <div className="max-w-md">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              How can I help you today?
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Start a new conversation by clicking on the "New chat" button or
              select an existing conversation from the sidebar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
