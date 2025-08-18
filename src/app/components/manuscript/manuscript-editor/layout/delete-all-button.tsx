// src/app/components/manuscript/manuscript-editor/layout/delete-all-button.tsx
// ✨ ENHANCED: Compact delete all button with size prop and better UX

import React, { useState, useRef, useEffect } from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

type ButtonSize = "xs" | "sm" | "md" | "lg";

interface DeleteAllManuscriptButtonProps {
  novelId: string;
  onSuccess: () => void;
  size?: ButtonSize;
  className?: string;
}

export const DeleteAllManuscriptButton: React.FC<
  DeleteAllManuscriptButtonProps
> = ({ novelId, onSuccess, size = "sm", className = "" }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowConfirm(false);
      }
    };

    if (showConfirm) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showConfirm]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/novels/${novelId}/structure`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("✅ Manuscript structure deleted successfully");
        onSuccess();
        setShowConfirm(false);
      } else {
        const error = await response.json();
        console.error("❌ Failed to delete manuscript structure:", error);
        alert(
          "Failed to delete manuscript structure: " +
            (error.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("❌ Error deleting manuscript structure:", error);
      alert("Error deleting manuscript structure. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  // Size configurations
  const sizeConfig = {
    xs: {
      button: "px-1.5 py-1 text-xs",
      icon: "w-3 h-3",
      text: "Del",
    },
    sm: {
      button: "px-2 py-1.5 text-xs",
      icon: "w-3 h-3",
      text: "Delete",
    },
    md: {
      button: "px-3 py-2 text-sm",
      icon: "w-4 h-4",
      text: "Delete All",
    },
    lg: {
      button: "px-4 py-2 text-sm",
      icon: "w-4 h-4",
      text: "Delete All",
    },
  };

  const config = sizeConfig[size];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main Delete Button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className={`
          ${config.button}
          border border-red-600/50 text-red-400 
          hover:bg-red-900/30 hover:border-red-500 hover:text-red-300
          disabled:opacity-50 disabled:cursor-not-allowed
          rounded transition-all duration-200
          flex items-center space-x-1
        `}
        title="Delete all manuscript content"
      >
        <Trash2 className={config.icon} />
        {size !== "xs" && <span>{config.text}</span>}
      </button>

      {/* ✨ COMPACT: Dropdown-style Confirmation */}
      {showConfirm && (
        <div className="absolute top-full right-0 mt-1 z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-gray-800 border border-red-600/50 rounded-lg shadow-xl p-3 min-w-64">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">
                  Confirm Delete
                </span>
              </div>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Warning Message */}
            <p className="text-xs text-gray-300 mb-3">
              This will permanently delete all acts, chapters, and scenes. This
              action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`
                  flex-1 px-3 py-1.5 text-xs font-medium
                  bg-red-600 text-white hover:bg-red-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  rounded transition-colors
                  ${isDeleting ? "animate-pulse" : ""}
                `}
              >
                {isDeleting ? "Deleting..." : "Delete All"}
              </button>

              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className="
                  px-3 py-1.5 text-xs font-medium
                  border border-gray-600 text-gray-400 
                  hover:bg-gray-700 hover:text-gray-300
                  disabled:opacity-50
                  rounded transition-colors
                "
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
