// src/app/components/manuscript/manuscript-editor/layout/manuscript-navigation-bar.tsx
// Clean navigation bar component with clear primary/secondary separation

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  NavigationContext,
  PrimaryNavigation,
  SecondaryNavigation,
} from "@/hooks/manuscript/navigation/types";

interface ManuscriptNavigationBarProps {
  navigationContext: NavigationContext;
}

interface NavigationLevelProps {
  navigation: PrimaryNavigation | SecondaryNavigation;
  level: "primary" | "secondary";
  isSecondary?: boolean;
}

// Single navigation level component
const NavigationLevel: React.FC<NavigationLevelProps> = ({
  navigation,
  level,
  isSecondary = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (itemId: string) => {
    console.log(`${level} item clicked:`, itemId);

    if (level === "primary") {
      (navigation as PrimaryNavigation).onSelect(itemId);
    } else {
      (navigation as SecondaryNavigation).onScrollTo(itemId);
    }

    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <div
      className={`flex items-center space-x-2 ${isSecondary ? "text-sm" : ""}`}
    >
      {/* Previous Button */}
      <button
        onClick={navigation.onPrevious}
        disabled={!navigation.hasPrevious}
        className={`p-1 rounded transition-colors ${
          navigation.hasPrevious
            ? "text-gray-300 hover:text-white hover:bg-gray-700"
            : "text-gray-600 cursor-not-allowed"
        }`}
        title={`Previous ${navigation.type}`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Title with Dropdown */}
      <div className="relative min-w-96" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors hover:bg-gray-700 min-w-full ${
            isSecondary ? "text-gray-300" : "text-white"
          }`}
        >
          <span className="font-medium truncate">
            {navigation.current?.title || `Select ${navigation.type}`}
          </span>
          <ChevronDown
            className={`w-3 h-3 transition-transform flex-shrink-0 ml-auto ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-80 max-h-64 overflow-y-auto">
            {navigation.items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-gray-700 ${
                  item.isCurrent
                    ? "bg-blue-900/30 text-blue-300"
                    : "text-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{item.title}</span>
                  {item.isCurrent && (
                    <span className="text-xs text-blue-400">current</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={navigation.onNext}
        disabled={!navigation.hasNext}
        className={`p-1 rounded transition-colors ${
          navigation.hasNext
            ? "text-gray-300 hover:text-white hover:bg-gray-700"
            : "text-gray-600 cursor-not-allowed"
        }`}
        title={`Next ${navigation.type}`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Position Indicator */}
      {navigation.items.length > 0 && navigation.current && (
        <span className="text-xs text-gray-500 ml-2">
          (
          {navigation.items.findIndex(
            (item) => item.id === navigation.current?.id
          ) + 1}{" "}
          of {navigation.items.length})
        </span>
      )}
    </div>
  );
};

// Main navigation bar component
export const ManuscriptNavigationBar: React.FC<
  ManuscriptNavigationBarProps
> = ({ navigationContext }) => {
  return (
    <div className="space-y-2">
      {/* Primary Navigation Level */}
      <NavigationLevel
        navigation={navigationContext.navigation.primary}
        level="primary"
        isSecondary={false}
      />

      {/* Secondary Navigation Level (for Chapter and Act views) */}
      {"secondary" in navigationContext.navigation && (
        <div className="pl-4 border-l-2 border-gray-700">
          <NavigationLevel
            navigation={navigationContext.navigation.secondary}
            level="secondary"
            isSecondary={true}
          />
        </div>
      )}
    </div>
  );
};

/*
===== CLEAN NAVIGATION BAR =====

✅ SIMPLE ARCHITECTURE:
- Single NavigationLevel component handles both primary and secondary
- Clear distinction between onSelect (primary) and onScrollTo (secondary)
- Clean props interface with proper typing

✅ PROPER EVENT HANDLING:
- Dedicated handleItemClick with level-aware logic
- Proper dropdown management with refs
- Clean outside click detection

✅ ADAPTIVE RENDERING:
- Scene view: Only primary level
- Chapter view: Primary (chapters) + Secondary (scenes)
- Act view: Primary (acts) + Secondary (chapters)

✅ CONSISTENT UI:
- Same visual design for both levels
- Clear visual hierarchy with indentation
- Proper disabled states and position indicators

This is much cleaner and easier to maintain!
*/
