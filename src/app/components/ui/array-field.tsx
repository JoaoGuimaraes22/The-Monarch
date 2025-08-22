// app/components/ui/array-field.tsx
// Enhanced ArrayField component with continuous focus for faster multi-item entry
// Integrates with existing UI component library and maintains clean component organization

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { Plus, Minus } from "lucide-react";
import { Input } from "./input";

interface ArrayFieldProps {
  label: string;
  items: string[];
  setItems: (items: string[]) => void;
  placeholder: string;
  maxItems?: number;
  continuousFocus?: boolean; // New feature flag
  inputClassName?: string;
  containerClassName?: string;
}

export const ArrayField: React.FC<ArrayFieldProps> = ({
  label,
  items,
  setItems,
  placeholder,
  maxItems = 10,
  continuousFocus = true, // Default to enabled
  inputClassName = "",
  containerClassName = "",
}) => {
  const [newItem, setNewItem] = useState("");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const arrayFieldInputRef = useRef<HTMLInputElement>(null);

  // Only focus after user has interacted, not on mount
  const shouldAutoFocus = continuousFocus && hasUserInteracted;

  const addArrayItem = (value: string, shouldFocusNext = true) => {
    const trimmedValue = value.trim();
    if (
      trimmedValue &&
      !items.includes(trimmedValue) &&
      items.length < maxItems
    ) {
      setItems([...items, trimmedValue]);
      setNewItem("");
      setHasUserInteracted(true); // Mark as interacted

      // Auto-focus for continuous entry only after user interaction
      if (shouldAutoFocus && shouldFocusNext && arrayFieldInputRef.current) {
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          arrayFieldInputRef.current?.focus();
        }, 50);
      }
    }
  };

  const removeArrayItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newItem.trim()) {
      e.preventDefault();
      addArrayItem(newItem, true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setNewItem("");
      arrayFieldInputRef.current?.blur();
    }
  };

  const handleAddClick = () => {
    setHasUserInteracted(true); // Mark as interacted
    addArrayItem(newItem, true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem(e.target.value);
    if (!hasUserInteracted) {
      setHasUserInteracted(true); // Mark as interacted when they start typing
    }
  };

  const handleInputFocus = () => {
    setHasUserInteracted(true); // Mark as interacted when they focus
  };

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label}{" "}
        {items.length > 0 && (
          <span className="text-gray-500">({items.length})</span>
        )}
        {items.length >= maxItems && (
          <span className="text-yellow-400 text-xs ml-2">(Max reached)</span>
        )}
      </label>

      {/* Existing items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 text-sm rounded border border-gray-600">
              {item}
            </span>
            <button
              type="button"
              onClick={() => removeArrayItem(index)}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
              title={`Remove "${item}"`}
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add new item input */}
        {items.length < maxItems && (
          <div className="flex items-center space-x-2">
            <Input
              ref={arrayFieldInputRef}
              value={newItem}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              className={`flex-1 ${inputClassName}`}
              maxLength={100} // Reasonable limit for array items
            />
            <button
              type="button"
              onClick={handleAddClick}
              disabled={!newItem.trim()}
              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              title="Add item"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced version with additional features for advanced use cases
interface AdvancedArrayFieldProps extends ArrayFieldProps {
  allowDuplicates?: boolean;
  customValidator?: (value: string) => boolean;
  customErrorMessage?: string;
  onItemAdded?: (item: string, allItems: string[]) => void;
  onItemRemoved?: (item: string, allItems: string[]) => void;
  sortItems?: boolean;
}

export const AdvancedArrayField: React.FC<AdvancedArrayFieldProps> = ({
  allowDuplicates = false,
  customValidator,
  customErrorMessage,
  onItemAdded,
  onItemRemoved,
  sortItems = false,
  ...props
}) => {
  const [validationError, setValidationError] = useState<string>("");

  const enhancedSetItems = (newItems: string[]) => {
    const processedItems = sortItems ? [...newItems].sort() : newItems;
    props.setItems(processedItems);
  };

  const enhancedAddItem = (value: string) => {
    const trimmedValue = value.trim();
    setValidationError("");

    // Custom validation
    if (customValidator && !customValidator(trimmedValue)) {
      setValidationError(customErrorMessage || "Invalid input");
      return false;
    }

    // Duplicate check
    if (!allowDuplicates && props.items.includes(trimmedValue)) {
      setValidationError("This item already exists");
      return false;
    }

    // Max items check
    if (props.items.length >= (props.maxItems || 10)) {
      setValidationError("Maximum number of items reached");
      return false;
    }

    const newItems = [...props.items, trimmedValue];
    enhancedSetItems(newItems);
    onItemAdded?.(trimmedValue, newItems);
    return true;
  };

  const enhancedRemoveItem = (index: number) => {
    const itemToRemove = props.items[index];
    const newItems = props.items.filter((_, i) => i !== index);
    enhancedSetItems(newItems);
    onItemRemoved?.(itemToRemove, newItems);
  };

  // Create a custom ArrayField that uses our enhanced functions
  const enhancedProps = {
    ...props,
    setItems: enhancedSetItems,
  };

  return (
    <div>
      <ArrayField {...enhancedProps} />
      {validationError && (
        <div className="text-red-400 text-xs mt-1">{validationError}</div>
      )}
    </div>
  );
};
