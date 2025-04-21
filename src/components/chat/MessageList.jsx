"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import ThinkingAnimation from "./ThinkingAnimation";
import { useSelector } from "react-redux";

export default function MessageList({ messages }) {
  const { loading } = useSelector((state) => state.chat);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {loading && <ThinkingAnimation />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
