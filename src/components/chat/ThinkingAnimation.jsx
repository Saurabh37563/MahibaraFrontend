export default function ThinkingAnimation() {
  return (
    <div className="flex items-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg max-w-[80%]">
      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
        AI
      </div>
      <div className="flex items-center gap-1">
        <div
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"
          style={{ animationDelay: "200ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"
          style={{ animationDelay: "400ms" }}
        ></div>
      </div>
    </div>
  );
}
