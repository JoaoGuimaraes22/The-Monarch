// app/components/characters/character-detail-content/character-relationships/character-relationships-section.tsx
// Updated character relationships section using modular components

import React, { useState } from "react";
import { useCharacterRelationships } from "@/hooks/characters";
import type { Character } from "@/lib/characters/character-service";
import {
  RelationshipsHeader,
  RelationshipsGrid,
  RelationshipsEmptyState,
  RelationshipsLoadingState,
  RelationshipsErrorState,
} from "./index";

interface CharacterRelationshipsSectionProps {
  character: Character;
  novelId: string;
}

export const CharacterRelationshipsSection: React.FC<
  CharacterRelationshipsSectionProps
> = ({ character, novelId }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Use the relationship hook
  const {
    relationships,
    isLoading,
    error,
    createRelationship,
    deleteRelationship,
    refetch,
    isCreating,
    isDeleting,
  } = useCharacterRelationships(novelId, character.id);

  // Handle add relationship
  const handleAddRelationship = () => {
    setShowCreateDialog(true);
    // TODO: Open create relationship dialog
    console.log("Open create relationship dialog");
  };

  // Handle view relationship details
  const handleViewDetails = (relationshipId: string) => {
    // TODO: Navigate to relationship detail view
    console.log("View relationship details:", relationshipId);
  };

  // Handle delete relationship
  const handleDeleteRelationship = async (relationshipId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this relationship? This will also delete the reciprocal relationship."
      )
    ) {
      await deleteRelationship(relationshipId);
    }
  };

  // Handle retry on error
  const handleRetry = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return <RelationshipsLoadingState character={character} />;
  }

  // Error state
  if (error) {
    return (
      <RelationshipsErrorState
        character={character}
        error={error}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="space-y-6">
      <RelationshipsHeader
        character={character}
        relationshipCount={relationships.length}
        onAddRelationship={handleAddRelationship}
        isCreating={isCreating}
      />

      {relationships.length === 0 ? (
        <RelationshipsEmptyState
          character={character}
          onAddRelationship={handleAddRelationship}
          isCreating={isCreating}
        />
      ) : (
        <RelationshipsGrid
          relationships={relationships}
          onViewDetails={handleViewDetails}
          onDeleteRelationship={handleDeleteRelationship}
          isDeleting={isDeleting}
        />
      )}

      {/* TODO: Create Relationship Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">
              Create Relationship
            </h3>
            <p className="text-gray-400 mb-4">
              Create relationship dialog will be implemented next.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-gray-400 hover:text-white"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => setShowCreateDialog(false)}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
