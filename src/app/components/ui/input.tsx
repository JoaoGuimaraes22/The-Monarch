// app/components/ui/input.tsx
// Updated Input component with label support, number support, forwardRef and enhanced features

import React, { forwardRef } from "react";
import { LucideIcon } from "lucide-react";

interface InputProps {
  type?: "text" | "email" | "password" | "number" | "search" | "url";
  label?: string; // ✨ NEW: Add label support
  placeholder?: string;
  value?: string | number; // ✅ UPDATED: Now accepts both string and number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void; // ✨ NEW: Add onFocus support
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; // ✨ NEW: Add onBlur support
  disabled?: boolean;
  error?: boolean;
  icon?: LucideIcon;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
}

// ✨ NEW: forwardRef support for focus management
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      label,
      placeholder,
      value,
      onChange,
      onKeyDown,
      onFocus, // ✨ NEW: Add onFocus support
      onBlur, // ✨ NEW: Add onBlur support
      disabled = false,
      error = false,
      icon: Icon,
      className = "",
      min,
      max,
      maxLength,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-700";
    const normalStyles =
      "border-gray-600 focus:border-red-500 focus:ring-red-500";
    const errorStyles =
      "border-red-500 focus:border-red-500 focus:ring-red-500";
    const disabledStyles = "bg-gray-800 cursor-not-allowed";

    const inputStyles = `${baseStyles} ${error ? errorStyles : normalStyles} ${
      disabled ? disabledStyles : ""
    } ${Icon ? "pl-10" : "px-3"} py-2 text-white placeholder-gray-400`;

    // Convert value to string for input element
    const inputValue =
      value !== undefined && value !== null ? String(value) : "";

    // Generate unique ID for accessibility
    const inputId =
      props.id ||
      (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`${className}`}>
        {/* ✨ NEW: Optional label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-400 mb-2"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <input
            ref={ref} // ✨ NEW: Forward ref for focus management
            id={inputId}
            type={type}
            className={inputStyles}
            placeholder={placeholder}
            value={inputValue} // ✅ UPDATED: Convert to string
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus} // ✨ NEW: Add onFocus support
            onBlur={onBlur} // ✨ NEW: Add onBlur support
            disabled={disabled}
            min={min}
            max={max}
            maxLength={maxLength}
            {...props}
          />
        </div>
      </div>
    );
  }
);

// ✨ NEW: Add display name for debugging
Input.displayName = "Input";

interface TextareaProps {
  label?: string; // ✨ NEW: Add label support
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void; // ✨ NEW: Add onFocus support
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void; // ✨ NEW: Add onBlur support
  rows?: number;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  resize?: boolean;
  maxLength?: number;
}

// ✨ NEW: forwardRef support for Textarea as well
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      onKeyDown,
      onFocus, // ✨ NEW: Add onFocus support
      onBlur, // ✨ NEW: Add onBlur support
      rows = 4,
      disabled = false,
      error = false,
      className = "",
      resize = true,
      maxLength,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-2 bg-gray-700";
    const normalStyles =
      "border-gray-600 focus:border-red-500 focus:ring-red-500";
    const errorStyles =
      "border-red-500 focus:border-red-500 focus:ring-red-500";
    const disabledStyles = "bg-gray-800 cursor-not-allowed";
    const resizeStyles = resize ? "resize-y" : "resize-none";

    const textareaStyles = `${baseStyles} ${
      error ? errorStyles : normalStyles
    } ${
      disabled ? disabledStyles : ""
    } ${resizeStyles} text-white placeholder-gray-400`;

    // Generate unique ID for accessibility
    const textareaId =
      props.id ||
      (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={className}>
        {/* ✨ NEW: Optional label */}
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-400 mb-2"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref} // ✨ NEW: Forward ref for focus management
          id={textareaId}
          className={textareaStyles}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={onFocus} // ✨ NEW: Add onFocus support
          onBlur={onBlur} // ✨ NEW: Add onBlur support
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          {...props}
        />
      </div>
    );
  }
);

// ✨ NEW: Add display name for debugging
Textarea.displayName = "Textarea";
