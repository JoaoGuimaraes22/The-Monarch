// app/components/ui/card.tsx
// Enhanced Card component with CardHeader icon support while maintaining backwards compatibility

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  hover = false,
  onClick,
}) => {
  const baseStyles = "bg-gray-800 rounded-lg border border-gray-700 shadow-sm";
  const hoverStyles = hover
    ? "hover:shadow-md transition-shadow duration-200"
    : "";
  const clickableStyles = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// ✅ ENHANCED: CardHeader with optional icon support while remaining backwards compatible
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  // ✨ NEW: Optional icon support
  icon?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  actions,
  className = "",
  icon, // ✨ NEW: Optional icon prop
}) => (
  <div className={`p-6 border-b border-gray-700 ${className}`}>
    <div className="flex justify-between items-start">
      <div className="flex items-center space-x-3">
        {" "}
        {/* ✨ NEW: Flex container for icon + text */}
        {icon /* ✨ NEW: Optional icon display */ && (
          <div className="flex-shrink-0">{icon}</div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-gray-300 mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
  </div>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
}) => <div className={`p-6 ${className}`}>{children}</div>;
