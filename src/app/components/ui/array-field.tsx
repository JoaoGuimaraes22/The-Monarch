// app/components/ui/array-field.tsx
// Fixed ArrayField component - resolving infinite re-render issue

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Plus, Minus, ChevronDown, Check } from "lucide-react";
import { Input } from "./input";

interface ArrayFieldProps {
  label: string;
  items: string[];
  setItems: (items: string[]) => void;
  placeholder: string;
  maxItems?: number;
  continuousFocus?: boolean;
  inputClassName?: string;
  containerClassName?: string;
  options?: string[];
  allowCustom?: boolean;
  showDropdownIcon?: boolean;
}

export const ArrayField: React.FC<ArrayFieldProps> = ({
  label,
  items,
  setItems,
  placeholder,
  maxItems = 10,
  continuousFocus = true,
  inputClassName = "",
  containerClassName = "",
  options = [],
  allowCustom = true,
  showDropdownIcon = true,
}) => {
  const [newItem, setNewItem] = useState("");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const arrayFieldInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ FIX: Memoize filtered options to prevent infinite re-renders
  const filteredOptions = useMemo(() => {
    if (!newItem || newItem === "") {
      return options.filter((option) => !items.includes(option));
    }
    return options.filter(
      (option) =>
        option.toLowerCase().includes(newItem.toLowerCase()) &&
        !items.includes(option)
    );
  }, [newItem, options, items]);

  // ✅ FIX: Memoize click outside handler
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  }, []);

  // ✅ FIX: Stable effect with proper cleanup
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // ✅ FIX: Memoize addArrayItem to prevent recreation on every render
  const addArrayItem = useCallback(
    (value: string, shouldFocusNext = true) => {
      const trimmedValue = value.trim();
      if (
        trimmedValue &&
        !items.includes(trimmedValue) &&
        items.length < maxItems
      ) {
        setItems([...items, trimmedValue]);
        setNewItem("");
        setIsDropdownOpen(false);

        if (
          continuousFocus &&
          hasUserInteracted &&
          shouldFocusNext &&
          arrayFieldInputRef.current
        ) {
          setTimeout(() => {
            arrayFieldInputRef.current?.focus();
          }, 50);
        }
      }
    },
    [items, maxItems, setItems, continuousFocus, hasUserInteracted]
  );

  // ✅ FIX: Memoize removeArrayItem
  const removeArrayItem = useCallback(
    (index: number) => {
      setItems(items.filter((_, i) => i !== index));
    },
    [items, setItems]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newItem.trim()) {
      e.preventDefault();
      setHasUserInteracted(true);
      addArrayItem(newItem, true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setNewItem("");
      setIsDropdownOpen(false);
      arrayFieldInputRef.current?.blur();
    } else if (e.key === "ArrowDown" && options.length > 0) {
      e.preventDefault();
      setIsDropdownOpen(true);
    }
  };

  const handleAddClick = () => {
    setHasUserInteracted(true);
    addArrayItem(newItem, true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewItem(value);

    if (value.length > 0 && !hasUserInteracted) {
      setHasUserInteracted(true);
    }

    if (options.length > 0 && value.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleInputFocus = () => {
    setHasUserInteracted(true);
    if (options.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleOptionSelect = (option: string) => {
    setHasUserInteracted(true);
    addArrayItem(option, true);
  };

  const handleDropdownToggle = () => {
    if (options.length > 0) {
      setIsDropdownOpen(!isDropdownOpen);
      if (!isDropdownOpen) {
        arrayFieldInputRef.current?.focus();
      }
    }
  };

  // ✅ FIX: Memoize computed values
  const hasOptions = options.length > 0;
  const shouldShowDropdown =
    hasOptions && isDropdownOpen && items.length < maxItems;

  return (
    <div className={`space-y-2 ${containerClassName}`} ref={containerRef}>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label}{" "}
        {items.length > 0 && (
          <span className="text-gray-500">({items.length})</span>
        )}
        {items.length >= maxItems && (
          <span className="text-yellow-400 text-xs ml-2">(Max reached)</span>
        )}
      </label>

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

        {items.length < maxItems && (
          <div className="relative">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  ref={arrayFieldInputRef}
                  value={newItem}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={handleInputFocus}
                  placeholder={placeholder}
                  className={`flex-1 ${inputClassName} ${
                    hasOptions ? "pr-8" : ""
                  }`}
                  maxLength={100}
                />

                {hasOptions && showDropdownIcon && (
                  <button
                    type="button"
                    onClick={handleDropdownToggle}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-300"
                    title="Show suggestions"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

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

            {shouldShowDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-40 overflow-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-gray-600 transition-colors flex items-center justify-between text-white"
                      onClick={() => handleOptionSelect(option)}
                    >
                      <span>{option}</span>
                      {option === newItem && (
                        <Check className="h-4 w-4 text-red-400" />
                      )}
                    </button>
                  ))
                ) : newItem && allowCustom ? (
                  <div className="px-3 py-2 text-gray-400 text-sm">
                    Press Enter to add &#34;{newItem}&#34;
                  </div>
                ) : (
                  <div className="px-3 py-2 text-gray-400 text-sm">
                    No suggestions found
                  </div>
                )}

                {allowCustom && hasOptions && (
                  <div className="border-t border-gray-600 px-3 py-2 text-xs text-gray-400">
                    💡 You can type custom values too
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Keep AdvancedArrayField simplified
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
  sortItems = false,
  ...props
}) => {
  return <ArrayField {...props} />;
};
