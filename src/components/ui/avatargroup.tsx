"use client";

import * as React from "react";
import { Avatar } from "./avatar";
import { cn } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of Avatar elements to display */
  children: React.ReactNode;
  /** Maximum number of avatars to show before displaying a count */
  max?: number;
  /** Custom rendering for the overflow count */
  renderOverflow?: (overflowCount: number) => React.ReactNode;
  /** Spacing between avatars (-4 to -1, defaults to -3) */
  spacing?: -4 | -3 | -2 | -1;
  /** Size of the avatars */
  size?: AvatarSize;
}

const sizeMap = {
  xs: {
    avatar: "h-5 w-5",
    font: "text-[10px]",
  },
  sm: {
    avatar: "h-8 w-8",
    font: "text-xs",
  },
  md: {
    avatar: "h-10 w-10",
    font: "text-sm",
  },
  lg: {
    avatar: "h-12 w-12",
    font: "text-base",
  },
  xl: {
    avatar: "h-14 w-14",
    font: "text-lg",
  },
};

/**
 * AvatarGroup displays multiple Avatar components with a configurable overlap effect
 */
const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      children,
      className,
      max = 3, // Default to showing only 3 avatars
      renderOverflow,
      spacing = -3,
      size = "md",
      ...props
    },
    ref
  ) => {
    const childrenArray = React.Children.toArray(children).filter(Boolean);
    const totalAvatars = childrenArray.length;
    const displayedAvatars = max ? childrenArray.slice(0, max) : childrenArray;
    const overflowCount = Math.max(0, totalAvatars - max);

    // Convert spacing value to tailwind classes
    const getSpacingClass = (value: -4 | -3 | -2 | -1) => {
      const spacingMap = {
        "-4": "-ml-4",
        "-3": "-ml-3",
        "-2": "-ml-2",
        "-1": "-ml-1",
      };
      return spacingMap[value];
    };

    const spacingClass = getSpacingClass(spacing);

    // Get size classes based on size prop
    const getSizeClasses = (size: AvatarSize) => {
      if (typeof size === "number") {
        return {
          avatar: `h-[${size}px] w-[${size}px]`,
          font:
            size <= 32
              ? "text-xs"
              : size <= 40
              ? "text-sm"
              : size <= 48
              ? "text-base"
              : "text-lg",
        };
      }
      return sizeMap[size];
    };

    const sizeClasses = getSizeClasses(size);

    // Clone and modify children to add size prop
    const modifiedChildren = displayedAvatars.map((child, index) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          className: cn(child.props.className, sizeClasses.avatar),
        });
      }
      return child;
    });

    return (
      <div
        ref={ref}
        data-slot="avatar-group"
        className={cn("flex flex-row", className)}
        {...props}
      >
        {modifiedChildren.map((child, index) => (
          <div
            key={index}
            className={cn(
              "relative inline-block border-2 border-background rounded-full",
              index !== 0 ? spacingClass : "",
              `z-[${30 - index}]` // Higher z-index for earlier avatars
            )}
          >
            {child}
          </div>
        ))}

        {overflowCount > 0 && (
          <div
            className={cn(
              "relative inline-block border-2 border-background rounded-full",
              spacingClass,
              "z-0"
            )}
          >
            {renderOverflow ? (
              renderOverflow(overflowCount)
            ) : (
              <Avatar
                className={cn(
                  "bg-muted text-muted-foreground flex items-center justify-center",
                  sizeClasses.avatar
                )}
              >
                <span className={cn("font-medium", sizeClasses.font)}>
                  +{overflowCount}
                </span>
              </Avatar>
            )}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup };
