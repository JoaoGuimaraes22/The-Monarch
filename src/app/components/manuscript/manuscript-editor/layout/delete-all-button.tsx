// src/app/components/manuscript/delete-all-manuscript-button.tsx
// Emergency delete all manuscript structure button for debugging

import React, { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui";

interface DeleteAllManuscriptButtonProps {
  novelId: string;
  onSuccess: () => void;
  className?: string;
}

export const DeleteAllManuscriptButton: React.FC<
  DeleteAllManuscriptButtonProps
> = ({ novelId, onSuccess, className = "" }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

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

  if (!showConfirm) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        className={`border-red-600 text-red-400 hover:bg-red-900/20 hover:text-red-300 ${className}`}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete All
      </Button>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-2 px-3 py-2 bg-red-900/20 border border-red-600 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-red-400" />
        <span className="text-sm text-red-400">Delete ALL content?</span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
      >
        {isDeleting ? "Deleting..." : "YES, DELETE ALL"}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCancel}
        className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
      >
        Cancel
      </Button>
    </div>
  );
};
