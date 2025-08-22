// app/components/characters/main-page-content/characters-page-content.tsx
// Main characters page content component - Updated to always show layout

"use client";

import React, { useState } from "react";
import { useCharacters } from "@/hooks/characters/useCharacters";
import {
  CharactersHeader,
  CharactersStatsBar,
  CharactersSearchBar,
  CharactersGrid,
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

  // Handle character creation - Updated to match dialog interface
  const handleCreateCharacter = async (data: {
    name: string;
    species?: string;
    gender?: string;
    birthplace?: string;
    writerNotes?: string;
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

  // Always show the main layout - remove empty state condition
  return (
    <div className="p-8">
      {/* Header */}
      <CharactersHeader onCreateClick={() => setShowCreateDialog(true)} />

      {/* Statistics - Only show if we have data */}
      {statistics && <CharactersStatsBar statistics={statistics} />}

      {/* Search and Filter */}
      <CharactersSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Characters Grid - Will handle empty state internally */}
      <CharactersGrid
        characters={filteredCharacters}
        novelId={novelId}
        searchTerm={searchTerm}
        onClearSearch={() => setSearchTerm("")}
        onDelete={deleteCharacter}
        showCreateButton={characters.length === 0} // New prop for empty state
        onCreateClick={() => setShowCreateDialog(true)} // New prop for empty state
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
