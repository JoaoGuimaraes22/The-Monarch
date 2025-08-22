// app/components/ui/input.tsx
// Updated Input component with number support and enhanced features

import React from "react";
import { LucideIcon } from "lucide-react";

interface InputProps {
  type?: "text" | "email" | "password" | "number" | "search" | "url";
  placeholder?: string;
  value?: string | number; // ✅ UPDATED: Now accepts both string and number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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

export const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown,
  disabled = false,
  error = false,
  icon: Icon,
  className = "",
  min,
  max,
  maxLength,
  ...props
}) => {
  const baseStyles =
    "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-700";
  const normalStyles =
    "border-gray-600 focus:border-red-500 focus:ring-red-500";
  const errorStyles = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const disabledStyles = "bg-gray-800 cursor-not-allowed";

  const inputStyles = `${baseStyles} ${error ? errorStyles : normalStyles} ${
    disabled ? disabledStyles : ""
  } ${Icon ? "pl-10" : "px-3"} py-2 text-white placeholder-gray-400`;

  // Convert value to string for input element
  const inputValue = value !== undefined && value !== null ? String(value) : "";

  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        className={inputStyles}
        placeholder={placeholder}
        value={inputValue} // ✅ UPDATED: Convert to string
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        min={min}
        max={max}
        maxLength={maxLength}
        {...props}
      />
    </div>
  );
};

interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
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

export const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  value,
  onChange,
  onKeyDown,
  rows = 4,
  disabled = false,
  error = false,
  className = "",
  resize = true,
  maxLength,
  ...props
}) => {
  const baseStyles =
    "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-2 bg-gray-700";
  const normalStyles =
    "border-gray-600 focus:border-red-500 focus:ring-red-500";
  const errorStyles = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const disabledStyles = "bg-gray-800 cursor-not-allowed";
  const resizeStyles = resize ? "resize-y" : "resize-none";

  const textareaStyles = `${baseStyles} ${error ? errorStyles : normalStyles} ${
    disabled ? disabledStyles : ""
  } ${resizeStyles} text-white placeholder-gray-400`;

  return (
    <textarea
      className={`${textareaStyles} ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      rows={rows}
      disabled={disabled}
      maxLength={maxLength}
      {...props}
    />
  );
};
