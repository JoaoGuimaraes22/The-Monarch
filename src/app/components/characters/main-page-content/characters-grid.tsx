// app/components/characters/main-page-content/characters-grid.tsx
// Grid display for characters with navigation support

import React from "react";
import { CharacterCard } from "./character-card";
import type { CharacterWithCurrentState } from "@/lib/characters/character-service";

interface CharactersGridProps {
  characters: CharacterWithCurrentState[];
  novelId: string; // ✅ Required for navigation
  searchTerm?: string; // Optional search term for empty state
  onClearSearch?: () => void; // Optional clear search function
  onDelete: (characterId: string) => Promise<boolean>; // ✅ Matches your hook
  onEdit?: (character: CharacterWithCurrentState) => void; // Optional edit handler
}

export const CharactersGrid: React.FC<CharactersGridProps> = ({
  characters,
  novelId,
  searchTerm,
  onClearSearch,
  onDelete,
  onEdit,
}) => {
  // Handle empty search results
  if (characters.length === 0 && searchTerm) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-white mb-2">
          No characters found
        </h3>
        <p className="text-gray-400 mb-4">
          No characters match &#34;{searchTerm}&#34;. Try a different search
          term.
        </p>
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            Clear search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          novelId={novelId} // ✅ Pass novelId to character card
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
