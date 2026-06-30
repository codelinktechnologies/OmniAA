import React, { useRef, useState } from "react";

interface CardGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // e.g. "rgba(168, 85, 247, 0.15)"
  hoverBorderColor?: string; // e.g. "border-purple-500/50"
  key?: string | number | null;
}

export default function CardGlow({
  children,
  className = "",
  glowColor = "rgba(147, 51, 234, 0.12)", // Elegant purple glow by default
  hoverBorderColor = "hover:border-purple-500/40",
  ...rest
}: CardGlowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden transition-all duration-300 border ${hoverBorderColor} ${className}`}
      style={{
        "--mouse-x": `${coords.x}px`,
        "--mouse-y": `${coords.y}px`
      } as React.CSSProperties}
      {...rest}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), ${glowColor}, transparent 80%)`
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
