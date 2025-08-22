// app/components/ui/combo-select.tsx
// Combo select with predefined options + custom input capability

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown, Check } from "lucide-react";

interface ComboSelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  options: string[]; // Predefined options
  allowCustom?: boolean; // Allow typing custom values
  customPlaceholder?: string; // Placeholder for custom input
}

export const ComboSelect = forwardRef<HTMLInputElement, ComboSelectProps>(
  (
    {
      label,
      value = "",
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      error = false,
      className = "",
      placeholder = "Choose or type...",
      options = [],
      allowCustom = true,
      customPlaceholder = "Type custom value...",
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const [filteredOptions, setFilteredOptions] = useState(options);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Combine refs
    useEffect(() => {
      if (ref && typeof ref === "object") {
        ref.current = inputRef.current;
      }
    }, [ref]);

    // Update input value when prop changes
    useEffect(() => {
      setInputValue(value);
    }, [value]);

    // Filter options based on input
    useEffect(() => {
      if (!inputValue || inputValue === "") {
        setFilteredOptions(options);
      } else {
        const filtered = options.filter((option) =>
          option.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredOptions(filtered);
      }
    }, [inputValue, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const baseStyles =
      "block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-700";
    const normalStyles =
      "border-gray-600 focus:border-red-500 focus:ring-red-500";
    const errorStyles =
      "border-red-500 focus:border-red-500 focus:ring-red-500";
    const disabledStyles = "bg-gray-800 cursor-not-allowed";

    const inputStyles = `${baseStyles} ${error ? errorStyles : normalStyles} ${
      disabled ? disabledStyles : ""
    } px-3 py-2 pr-10 text-white placeholder-gray-400`;

    const selectId =
      props.id ||
      (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange?.(newValue);
      if (!isOpen) setIsOpen(true);
    };

    const handleOptionSelect = (option: string) => {
      setInputValue(option);
      onChange?.(option);
      setIsOpen(false);
      inputRef.current?.blur();
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsOpen(true);
      onFocus?.(e);
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Small delay to allow option selection
      setTimeout(() => setIsOpen(false), 150);
      onBlur?.(e);
    };

    const handleToggleDropdown = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      if (!isOpen) {
        inputRef.current?.focus();
      }
    };

    // Check if current value is a predefined option
    const isSelectedOption = options.includes(inputValue);

    return (
      <div className={`relative ${className}`} ref={containerRef}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-400 mb-2"
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Input with dropdown trigger */}
        <div className="relative">
          <input
            ref={inputRef}
            id={selectId}
            type="text"
            className={inputStyles}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled}
            {...props}
          />

          <button
            type="button"
            onClick={handleToggleDropdown}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={disabled}
          >
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Dropdown options */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className={`w-full px-3 py-2 text-left hover:bg-gray-600 transition-colors flex items-center justify-between ${
                    option === inputValue ? "bg-gray-600" : ""
                  }`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <span className="text-white">{option}</span>
                  {option === inputValue && (
                    <Check className="h-4 w-4 text-red-400" />
                  )}
                </button>
              ))
            ) : allowCustom && inputValue ? (
              <div className="px-3 py-2 text-gray-400 text-sm">
                Press Enter to use &#34;{inputValue}&#34;
              </div>
            ) : (
              <div className="px-3 py-2 text-gray-400 text-sm">
                No matching options
              </div>
            )}

            {/* Custom input hint */}
            {allowCustom && !isSelectedOption && (
              <div className="border-t border-gray-600 px-3 py-2 text-xs text-gray-400">
                💡 You can type a custom value
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ComboSelect.displayName = "ComboSelect";
