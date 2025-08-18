// src/app/components/ui/editable-text.tsx
// ✨ ENHANCED: Cleaner editing layout - buttons moved to parent control

import React, { useState, useRef, useEffect } from "react";
import { Edit2, Check, X } from "lucide-react";

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  onEditStart?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  disabled?: boolean;
  showButtons?: boolean; // ✨ NEW: Control whether to show inline buttons
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  onEditStart,
  onCancel,
  placeholder = "Enter text...",
  className = "",
  maxLength = 100,
  disabled = false,
  showButtons = true, // ✨ NEW: Default to true for backward compatibility
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

  // ✨ ENHANCED: Handle edit start with callback
  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    setIsEditing(true);
    setEditValue(value);

    if (onEditStart) {
      onEditStart();
    }
  };

  // ✨ NEW: Expose save method for parent control
  const handleSave = async () => {
    if (editValue.trim() === value.trim()) {
      setIsEditing(false);
      return;
    }

    if (editValue.trim() === "") {
      setEditValue(value);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      setEditValue(value);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  // ✨ NEW: Expose cancel method for parent control
  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);

    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  // ✨ NEW: Expose methods to parent through ref or props
  React.useImperativeHandle(onEditStart, () => ({
    save: handleSave,
    cancel: handleCancel,
    isEditing,
    isSaving,
  }));

  if (isEditing) {
    return (
      <div className="flex items-center space-x-1 min-w-0 flex-1">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          maxLength={maxLength}
          className="flex-1 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-red-500 min-w-0"
          placeholder={placeholder}
          disabled={isSaving}
        />
        {/* ✨ Conditional buttons - can be hidden for custom layout */}
        {showButtons && (
          <>
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
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 min-w-0 flex-1 group">
      <span className={`truncate ${className}`}>{value || placeholder}</span>
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
