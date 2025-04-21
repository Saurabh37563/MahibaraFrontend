
"use client"

import * as React from "react"
import { Avatar } from "./avatar"
import { cn } from "@/lib/utils"

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of Avatar elements to display */
  children: React.ReactNode
  /** Maximum number of avatars to show before displaying a count */
  max?: number
  /** Custom rendering for the overflow count */
  renderOverflow?: (overflowCount: number) => React.ReactNode
  /** Spacing between avatars (-4 to -1, defaults to -3) */
  spacing?: -4 | -3 | -2 | -1
}

/**
 * AvatarGroup displays multiple Avatar components with a configurable overlap effect
 */
const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ 
    children, 
    className, 
    max = 3, // Default to showing only 3 avatars
    renderOverflow,
    spacing = -3, 
    ...props 
  }, ref) => {
    const childrenArray = React.Children.toArray(children).filter(Boolean)
    const totalAvatars = childrenArray.length
    const displayedAvatars = max ? childrenArray.slice(0, max) : childrenArray
    const overflowCount = Math.max(0, totalAvatars - max)
    
    // Convert spacing value to tailwind classes
    const getSpacingClass = (value: number) => {
      const spacingMap = {
        '-4': '-ml-4',
        '-3': '-ml-3',
        '-2': '-ml-2',
        '-1': '-ml-1',
      }
      return spacingMap[value as keyof typeof spacingMap]
    }
    
    const spacingClass = getSpacingClass(spacing)

    return (
      <div
        ref={ref}
        data-slot="avatar-group"
        className={cn("flex flex-row", className)}
        {...props}
      >
        {displayedAvatars.map((child, index) => (
          <div 
            key={index} 
            className={cn(
              "relative inline-block border-2 border-background rounded-full",
              index !== 0 ? spacingClass : "",
              // Use actual tailwind classes for z-index
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
              <Avatar className="bg-muted text-muted-foreground flex items-center justify-center">
                <span className="text-xs font-medium">+{overflowCount}</span>
              </Avatar>
            )}
          </div>
        )}
      </div>
    )
  }
)

AvatarGroup.displayName = "AvatarGroup"

export { AvatarGroup }
