"use client";

import { BoundingBox } from "@/types";
import { cn } from "@/lib/utils";

interface HighlightOverlayProps {
  /** Bounding box coordinates at 100% zoom */
  boundingBox: BoundingBox;
  /** Current zoom level (50-200) */
  zoom: number;
  /** Whether the highlight is visible (false during page transitions) */
  isVisible: boolean;
  /** Optional additional class names */
  className?: string;
}

/**
 * Renders a semi-transparent highlight overlay over a document region.
 * Coordinates are scaled based on the current zoom level.
 */
export function HighlightOverlay({
  boundingBox,
  zoom,
  isVisible,
  className,
}: HighlightOverlayProps) {
  // Scale coordinates based on zoom level
  const scale = zoom / 100;

  const style: React.CSSProperties = {
    position: "absolute",
    left: `${boundingBox.x * scale}px`,
    top: `${boundingBox.y * scale}px`,
    width: `${boundingBox.width * scale}px`,
    height: `${boundingBox.height * scale}px`,
    pointerEvents: "none", // Allow clicks through the overlay
  };

  return (
    <div
      style={style}
      className={cn(
        // Base styles
        "rounded-sm border-2 border-blue-500",
        "bg-blue-500/20",
        // Animation
        "transition-all duration-200 ease-out",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        // Subtle pulsing effect when visible
        isVisible && "animate-pulse-highlight",
        className
      )}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-sm shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
    </div>
  );
}
