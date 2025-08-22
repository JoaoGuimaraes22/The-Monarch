// app/components/characters/main-page-content/characters-page-content.tsx
// Main characters page content component - FIXED with novelId

"use client";

import React, { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/app/components/ui";
import { useCharacters } from "@/hooks/characters/useCharacters";
import {
  CharactersHeader,
  CharactersStatsBar,
  CharactersSearchBar,
  CharactersGrid,
  CharactersEmptyState,
  CharactersLoadingState,
  CharactersErrorState,
  CreateCharacterDialog,
} from "./index";

interface CharactersPageContentProps {
  novelId: string;
}

export const CharactersPageContent: React.FC<CharactersPageContentProps> = ({
  novelId,
}) => {
  const {
    characters,
    statistics,
    isLoading,
    error,
    createCharacter,
    deleteCharacter,
  } = useCharacters(novelId);

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter characters based on search term
  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle character creation
  const handleCreateCharacter = async (data: {
    name: string;
    species?: string;
    gender?: string;
  }) => {
    const result = await createCharacter(data);
    if (result) {
      setShowCreateDialog(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <CharactersLoadingState />;
  }

  // Error state
  if (error) {
    return <CharactersErrorState error={error} />;
  }

  // Empty state (no characters and no search)
  if (characters.length === 0 && !searchTerm) {
    return (
      <CharactersEmptyState onCreateClick={() => setShowCreateDialog(true)} />
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <CharactersHeader onCreateClick={() => setShowCreateDialog(true)} />

      {/* Statistics */}
      {statistics && <CharactersStatsBar statistics={statistics} />}

      {/* Search and Filter */}
      <CharactersSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Characters Grid - FIX: Add novelId prop */}
      <CharactersGrid
        characters={filteredCharacters}
        novelId={novelId} // ✅ ADD THIS LINE
        searchTerm={searchTerm}
        onClearSearch={() => setSearchTerm("")}
        onDelete={deleteCharacter} // ✅ RENAME: onDeleteCharacter → onDelete (to match interface)
      />

      {/* Create Character Dialog */}
      {showCreateDialog && (
        <CreateCharacterDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={handleCreateCharacter}
        />
      )}
    </div>
  );
};
