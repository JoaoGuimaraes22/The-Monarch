// app/components/characters/characters-search-bar.tsx
// Search and filter bar for characters

import React from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/app/components/ui";

interface CharactersSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
}

export const CharactersSearchBar: React.FC<CharactersSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onFilterClick,
}) => {
  return (
    <div className="flex items-center space-x-4 mb-8">
      <div className="flex-1 relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search characters..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
        />
      </div>
      <Button variant="outline" icon={Filter} onClick={onFilterClick}>
        Filter
      </Button>
    </div>
  );
};
