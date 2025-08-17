import React from "react";
import { LucideIcon } from "lucide-react";

interface InputProps {
  type?: "text" | "email" | "password" | "number" | "search" | "url";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  icon?: LucideIcon;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  icon: Icon,
  className = "",
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
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
    </div>
  );
};

interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  resize?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  value,
  onChange,
  rows = 4,
  disabled = false,
  error = false,
  className = "",
  resize = true,
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
      rows={rows}
      disabled={disabled}
      {...props}
    />
  );
};
