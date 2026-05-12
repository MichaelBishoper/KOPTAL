"use client";

interface GapProps {
  height?: string;
  className?: string;
}

export default function Gap({ height = "h-8", className = "" }: GapProps) {
  return <div className={`${height} ${className}`} />;
}
