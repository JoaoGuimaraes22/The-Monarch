import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/app/components/ui";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  novelTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmationDialog: React.FC<
  DeleteConfirmationDialogProps
> = ({ isOpen, novelTitle, onConfirm, onCancel, isDeleting = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Novel
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold">&quot;{novelTitle}&quot;</span>?
          </p>
          <p className="text-sm text-red-600 mb-6">
            This action cannot be undone. All chapters, characters, and progress
            will be permanently lost.
          </p>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={onCancel} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Novel"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
