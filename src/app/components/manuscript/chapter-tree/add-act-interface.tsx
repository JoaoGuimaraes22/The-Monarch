// src/app/components/manuscript/chapter-tree/add-act-interface.tsx
import React, { useState } from "react";
import { Plus, Check, X } from "lucide-react";

interface AddActInterfaceProps {
  onAddAct: (title?: string, insertAfterActId?: string) => Promise<void>;
  insertAfterActId?: string;
  isInline?: boolean; // Whether this is shown inline between acts or as a header button
}

export const AddActInterface: React.FC<AddActInterfaceProps> = ({
  onAddAct,
  insertAfterActId,
  isInline = false,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartCreating = () => {
    setIsCreating(true);
    setTitle("");
  };

  const handleSave = async () => {
    if (!title.trim()) {
      // Use default title if empty
      await handleSubmit();
      return;
    }

    await handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onAddAct(title.trim() || undefined, insertAfterActId);
      setIsCreating(false);
      setTitle("");
    } catch (error) {
      console.error("Failed to create act:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isCreating) {
    return (
      <div
        className={`flex items-center space-x-2 p-2 ${
          isInline
            ? "bg-gray-700 border border-dashed border-gray-500 rounded"
            : "bg-gray-800 rounded"
        }`}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Act title (optional)..."
          className="bg-gray-700 text-white px-2 py-1 rounded text-sm flex-1 min-w-0"
          autoFocus
          disabled={isSubmitting}
        />
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="text-green-500 hover:text-green-400 p-1 disabled:opacity-50"
          title="Create act"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          className="text-red-500 hover:text-red-400 p-1"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleStartCreating}
      className={`flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors text-sm p-2 rounded ${
        isInline
          ? "border border-dashed border-gray-600 hover:border-blue-500 w-full justify-center"
          : "hover:bg-gray-700"
      }`}
    >
      <Plus className="w-4 h-4" />
      <span>{isInline ? "Add Act" : "Add new act"}</span>
    </button>
  );
};
