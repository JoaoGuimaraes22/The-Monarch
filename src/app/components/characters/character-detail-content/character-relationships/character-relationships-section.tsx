// app/components/characters/character-detail-content/character-relationships/character-relationships-section.tsx
// Updated character relationships section using modular components

import React, { useState } from "react";
import { useCharacterRelationships } from "@/hooks/characters";
import type { Character } from "@/lib/characters/character-service";
import type { RelationshipWithCharacters } from "@/lib/characters/relationship-service";
import {
  RelationshipsHeader,
  RelationshipsGrid,
  RelationshipsEmptyState,
  RelationshipsLoadingState,
  RelationshipsErrorState,
} from "./index";
import { CreateRelationshipDialog } from "./create-relationship-dialog";
import { RelationshipDetailView } from "./relationship-detail-view";

interface CharacterRelationshipsSectionProps {
  character: Character;
  novelId: string;
}

export const CharacterRelationshipsSection: React.FC<
  CharacterRelationshipsSectionProps
> = ({ character, novelId }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRelationship, setSelectedRelationship] =
    useState<RelationshipWithCharacters | null>(null);

  // Use the relationship hook
  const {
    relationships,
    isLoading,
    error,
    deleteRelationship,
    refetch,
    isCreating,
    isDeleting,
  } = useCharacterRelationships(novelId, character.id);

  // Handle add relationship
  const handleAddRelationship = () => {
    setShowCreateDialog(true);
  };

  // Handle view relationship details
  const handleViewDetails = (relationshipId: string) => {
    const relationship = relationships.find((rel) => rel.id === relationshipId);
    if (relationship) {
      setSelectedRelationship(relationship);
    }
  };

  // Handle back from detail view
  const handleBackFromDetail = () => {
    setSelectedRelationship(null);
  };

  // Handle edit relationship
  const handleEditRelationship = () => {
    // TODO: Open edit relationship dialog
    console.log("Edit relationship:", selectedRelationship?.id);
  };

  // Handle delete relationship from detail view
  const handleDeleteFromDetail = async () => {
    if (
      selectedRelationship &&
      confirm(
        "Are you sure you want to delete this relationship? This will also delete the reciprocal relationship."
      )
    ) {
      const success = await deleteRelationship(selectedRelationship.id);
      if (success) {
        setSelectedRelationship(null); // Go back to list
      }
    }
  };

  // Handle delete relationship from grid
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

  // Handle successful relationship creation
  const handleCreateSuccess = () => {
    refetch(); // Refresh the relationships list
  };

  // Show detail view if relationship selected
  if (selectedRelationship) {
    return (
      <RelationshipDetailView
        relationship={selectedRelationship}
        novelId={novelId}
        characterId={character.id}
        onBack={handleBackFromDetail}
        onEdit={handleEditRelationship}
        onDelete={handleDeleteFromDetail}
      />
    );
  }

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

      {/* Create Relationship Dialog */}
      <CreateRelationshipDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        character={character}
        novelId={novelId}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};
