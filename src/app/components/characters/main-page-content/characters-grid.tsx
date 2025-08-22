// app/components/characters/characters-grid.tsx
// Grid layout for character cards

import React from "react";
import { Users } from "lucide-react";
import { Button } from "@/app/components/ui";
import { CharacterCard } from "./character-card";
import type { CharacterWithCurrentState } from "@/lib/characters/character-service";

interface CharactersGridProps {
  characters: CharacterWithCurrentState[];
  searchTerm: string;
  onClearSearch: () => void;
  onDeleteCharacter: (id: string) => Promise<boolean>;
  onEditCharacter?: (character: CharacterWithCurrentState) => void;
  onViewCharacter?: (character: CharacterWithCurrentState) => void;
}

export const CharactersGrid: React.FC<CharactersGridProps> = ({
  characters,
  searchTerm,
  onClearSearch,
  onDeleteCharacter,
  onEditCharacter,
  onViewCharacter,
}) => {
  // No characters found state
  if (characters.length === 0) {
    return (
      <div className="text-center py-16">
        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400 mb-4">
          {searchTerm
            ? `No characters found matching "${searchTerm}"`
            : "No characters found"}
        </p>
        {searchTerm && (
          <Button variant="outline" onClick={onClearSearch}>
            Clear Search
          </Button>
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
          onDelete={onDeleteCharacter}
          onEdit={onEditCharacter}
          onView={onViewCharacter}
        />
      ))}
    </div>
  );
};
