"use client";

import { useState, useRef, useEffect } from "react";

export default function Tooltip({
  children,
  content,
  position = "top",
  delay = 300,
  className = "",
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  let timeout = null;

  useEffect(() => {
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [timeout]);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();

    let x, y;

    switch (position) {
      case "top":
        x = trigger.left + trigger.width / 2 - tooltip.width / 2;
        y = trigger.top - tooltip.height - 5;
        break;
      case "bottom":
        x = trigger.left + trigger.width / 2 - tooltip.width / 2;
        y = trigger.bottom + 5;
        break;
      case "left":
        x = trigger.left - tooltip.width - 5;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2;
        break;
      case "right":
        x = trigger.right + 5;
        y = trigger.top + trigger.height / 2 - tooltip.height / 2;
        break;
      default:
        x = trigger.left + trigger.width / 2 - tooltip.width / 2;
        y = trigger.top - tooltip.height - 5;
    }

    // Adjust if tooltip would appear off-screen
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x + tooltip.width > window.innerWidth)
      x = window.innerWidth - tooltip.width;
    if (y + tooltip.height > window.innerHeight)
      y = window.innerHeight - tooltip.height;

    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    timeout = setTimeout(() => {
      setIsVisible(true);
      // Wait for next render when tooltip is visible
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeout) clearTimeout(timeout);
    setIsVisible(false);
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg pointer-events-none ${className}`}
          style={{ top: `${coords.y}px`, left: `${coords.x}px` }}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45 ${
              position === "top"
                ? "bottom-0 translate-y-1/2"
                : position === "bottom"
                  ? "top-0 -translate-y-1/2"
                  : position === "left"
                    ? "right-0 translate-x-1/2"
                    : "left-0 -translate-x-1/2"
            } ${
              position === "top" || position === "bottom"
                ? "left-1/2 -translate-x-1/2"
                : "top-1/2 -translate-y-1/2"
            }`}
          />
        </div>
      )}
    </div>
  );
}
