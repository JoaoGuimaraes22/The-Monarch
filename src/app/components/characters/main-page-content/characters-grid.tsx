// app/components/characters/main-page-content/characters-grid.tsx
// Grid display for characters with navigation support

import React from "react";
import { CharacterCard } from "./character-card";
import type { CharacterWithCurrentState } from "@/lib/characters/character-service";

interface CharactersGridProps {
  characters: CharacterWithCurrentState[];
  novelId: string; // Add novelId for navigation
  onDelete: (characterId: string) => Promise<boolean>;
  onEdit?: (character: CharacterWithCurrentState) => void;
}

export const CharactersGrid: React.FC<CharactersGridProps> = ({
  characters,
  novelId,
  onDelete,
  onEdit,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          novelId={novelId} // Pass novelId to character card
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};
