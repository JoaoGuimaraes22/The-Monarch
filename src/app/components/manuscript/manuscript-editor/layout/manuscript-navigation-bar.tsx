// src/app/components/manuscript/manuscript-editor/layout/manuscript-navigation-bar.tsx
// Navigation component that adapts to view mode (Scene/Chapter/Act)

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import {
  NavigationContext,
  NavigationLevel,
} from "@/hooks/manuscript/useManuscriptNavigation";
import { ViewMode } from "@/app/components/manuscript/manuscript-editor/controls/view-mode-selector";

interface ManuscriptNavigationBarProps {
  viewMode: ViewMode;
  navigationContext: NavigationContext;
  onPreviousNavigation: () => void;
  onNextNavigation: () => void;
  onNavigationSelect: (itemId: string, level?: "primary" | "secondary") => void;
}

export const ManuscriptNavigationBar: React.FC<
  ManuscriptNavigationBarProps
> = ({
  viewMode,
  navigationContext,
  onPreviousNavigation,
  onNextNavigation,
  onNavigationSelect,
}) => {
  const [isPrimaryDropdownOpen, setIsPrimaryDropdownOpen] = useState(false);
  const [isSecondaryDropdownOpen, setIsSecondaryDropdownOpen] = useState(false);

  // ✅ FIX: Add refs to track dropdown containers
  const primaryDropdownRef = useRef<HTMLDivElement>(null);
  const secondaryDropdownRef = useRef<HTMLDivElement>(null);

  // ✅ FIX: Improved handleItemClick with proper event handling
  const handleItemClick = (
    itemId: string,
    levelType: "primary" | "secondary"
  ) => {
    console.log("Item clicked:", itemId);
    onNavigationSelect(itemId, levelType);

    // Close the appropriate dropdown
    if (levelType === "primary") {
      setIsPrimaryDropdownOpen(false);
    } else {
      setIsSecondaryDropdownOpen(false);
    }
  };

  // Render a single navigation level
  const renderNavigationLevel = (
    level: NavigationLevel,
    levelType: "primary" | "secondary",
    isSecondary = false
  ) => {
    const isDropdownOpen = isSecondary
      ? isSecondaryDropdownOpen
      : isPrimaryDropdownOpen;
    const setDropdownOpen = isSecondary
      ? setIsSecondaryDropdownOpen
      : setIsPrimaryDropdownOpen;

    // ✅ FIX: Get the correct ref for this dropdown
    const dropdownRef = isSecondary ? secondaryDropdownRef : primaryDropdownRef;

    return (
      <div
        className={`flex items-center space-x-2 ${
          isSecondary ? "text-sm" : ""
        }`}
      >
        {/* Previous Button */}
        <button
          onClick={onPreviousNavigation}
          disabled={!level.hasPrevious}
          className={`p-1 rounded transition-colors ${
            level.hasPrevious
              ? "text-gray-300 hover:text-white hover:bg-gray-700"
              : "text-gray-600 cursor-not-allowed"
          }`}
          title={`Previous ${level.type}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Title with Dropdown */}
        <div className="relative min-w-96" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors hover:bg-gray-700 min-w-full ${
              isSecondary ? "text-gray-300" : "text-white"
            }`}
          >
            <span className="font-medium truncate">{level.title}</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform flex-shrink-0 ml-auto ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 min-w-80 max-h-64 overflow-y-auto">
              {level.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id, levelType)}
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
          onClick={onNextNavigation}
          disabled={!level.hasNext}
          className={`p-1 rounded transition-colors ${
            level.hasNext
              ? "text-gray-300 hover:text-white hover:bg-gray-700"
              : "text-gray-600 cursor-not-allowed"
          }`}
          title={`Next ${level.type}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Position Indicator */}
        {level.items.length > 0 && (
          <span className="text-xs text-gray-500 ml-2">
            ({level.currentIndex + 1} of {level.items.length})
          </span>
        )}
      </div>
    );
  };

  // ✅ FIX: Properly check if click is outside dropdown containers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Check if click is outside primary dropdown
      if (
        isPrimaryDropdownOpen &&
        primaryDropdownRef.current &&
        !primaryDropdownRef.current.contains(target)
      ) {
        setIsPrimaryDropdownOpen(false);
      }

      // Check if click is outside secondary dropdown
      if (
        isSecondaryDropdownOpen &&
        secondaryDropdownRef.current &&
        !secondaryDropdownRef.current.contains(target)
      ) {
        setIsSecondaryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isPrimaryDropdownOpen, isSecondaryDropdownOpen]);

  return (
    <div className="space-y-2">
      {/* Primary Navigation Level */}
      {renderNavigationLevel(navigationContext.primary, "primary")}

      {/* Secondary Navigation Level (for Act view) */}
      {navigationContext.secondary && (
        <div className="pl-4 border-l-2 border-gray-700">
          {renderNavigationLevel(
            navigationContext.secondary,
            "secondary",
            true
          )}
        </div>
      )}
    </div>
  );
};

/*
===== FIXES APPLIED =====

✅ DROPDOWN CLICK FIX:
- Added refs to track dropdown containers
- Improved handleClickOutside to check if click is actually outside
- Created dedicated handleItemClick function
- Properly handle event propagation

✅ EVENT HANDLING:
- Separated item click logic from dropdown close logic
- Added console.log for debugging
- Ensured proper event flow

✅ IMPROVED ARCHITECTURE:
- Better separation of concerns
- More predictable dropdown behavior
- Cleaner event management

The key issue was that the original handleClickOutside was closing 
dropdowns on ANY mousedown event, even clicks inside the dropdown.
Now it properly checks if the click is outside the dropdown container.
*/
