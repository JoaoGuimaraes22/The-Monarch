// ==========================================
// FILE: src/app/components/ui/editable-text.tsx
// ==========================================

import React, { useState, useRef, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  disabled?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  placeholder = "Enter text...",
  className = "",
  maxLength = 100,
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent tree item selection
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = async () => {
    if (editValue.trim() === value.trim()) {
      setIsEditing(false);
      return;
    }

    if (editValue.trim() === "") {
      setEditValue(value); // Reset to original if empty
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      setEditValue(value); // Reset on error
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent tree keyboard navigation
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-1 min-w-0 flex-1">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          maxLength={maxLength}
          className="flex-1 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500 min-w-0"
          placeholder={placeholder}
          disabled={isSaving}
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="p-1 text-green-400 hover:text-green-300 transition-colors"
          title="Save"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="p-1 text-gray-400 hover:text-white transition-colors"
          title="Cancel"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 min-w-0 flex-1 group">
      <span className={`truncate ${className}`}>{value}</span>
      {!disabled && (
        <button
          onClick={handleStartEdit}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition-all"
          title="Edit name"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
