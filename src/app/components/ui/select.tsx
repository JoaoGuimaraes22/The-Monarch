// app/components/ui/select.tsx
// Select dropdown component following your design patterns

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      value,
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      error = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-700 appearance-none";
    const normalStyles =
      "border-gray-600 focus:border-red-500 focus:ring-red-500";
    const errorStyles =
      "border-red-500 focus:border-red-500 focus:ring-red-500";
    const disabledStyles = "bg-gray-800 cursor-not-allowed";

    const selectStyles = `${baseStyles} ${error ? errorStyles : normalStyles} ${
      disabled ? disabledStyles : ""
    } px-3 py-2 pr-10 text-white`;

    // Generate unique ID for accessibility
    const selectId =
      props.id ||
      (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`${className}`}>
        {/* Optional label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-400 mb-2"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={selectStyles}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            disabled={disabled}
            {...props}
          >
            {children}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    );
  }
);

Select.displayName = "Select";
