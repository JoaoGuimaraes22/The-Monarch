// app/components/characters/main-page-content/characters-grid.tsx
// Grid display for characters with integrated empty state

import React from "react";
import { Users, Plus } from "lucide-react";
import { Button } from "@/app/components/ui";
import { CharacterCard } from "./character-card";
import type { CharacterWithCurrentState } from "@/lib/characters/character-service";

interface CharactersGridProps {
  characters: CharacterWithCurrentState[];
  novelId: string;
  searchTerm?: string;
  onClearSearch?: () => void;
  onDelete: (characterId: string) => Promise<boolean>;
  onEdit?: (character: CharacterWithCurrentState) => void;
  showCreateButton?: boolean; // New prop for empty state
  onCreateClick?: () => void; // New prop for empty state
}

export const CharactersGrid: React.FC<CharactersGridProps> = ({
  characters,
  novelId,
  searchTerm,
  onClearSearch,
  onDelete,
  onEdit,
  showCreateButton = false,
  onCreateClick,
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

  // Handle completely empty state (no characters at all)
  if (characters.length === 0 && !searchTerm && showCreateButton) {
    return (
      <div className="text-center py-16">
        <Users className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h3 className="text-xl font-medium text-white mb-2">
          No characters yet
        </h3>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Start building your cast of characters. Create detailed profiles,
          track relationships, and manage character arcs across your story.
        </p>
        {onCreateClick && (
          <Button variant="primary" icon={Plus} onClick={onCreateClick}>
            Create Your First Character
          </Button>
        )}
      </div>
    );
  }

  // Normal grid with characters
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          novelId={novelId}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
