// app/components/characters/character-detail-content/character-relationships/character-relationships-section.tsx
// Character relationships section with complete edit support - Clean rewrite

import React, { useState } from "react";
import { useCharacterRelationships } from "@/hooks/characters";
import type { Character } from "@/lib/characters/character-service";
import type {
  RelationshipWithCharacters,
  UpdateRelationshipOptions,
} from "@/lib/characters/relationship-service";
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
  // Dialog and selection state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRelationship, setSelectedRelationship] =
    useState<RelationshipWithCharacters | null>(null);

  // Main relationships hook
  const {
    relationships,
    isLoading,
    error,
    updateRelationship,
    deleteRelationship,
    refetch,
    isCreating,
    isDeleting,
    isUpdating,
  } = useCharacterRelationships(novelId, character.id);

  // Handle add new relationship
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

  // Handle relationship update with proper typing
  const handleUpdateRelationship = async (
    relationshipId: string,
    updates: UpdateRelationshipOptions
  ): Promise<boolean> => {
    try {
      const result = await updateRelationship(relationshipId, updates);

      if (result) {
        // Update the selected relationship if it's currently being viewed
        if (
          selectedRelationship &&
          selectedRelationship.id === relationshipId
        ) {
          setSelectedRelationship({
            ...selectedRelationship,
            ...updates,
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating relationship:", error);
      return false;
    }
  };

  // Handle delete relationship from detail view
  const handleDeleteFromDetail = async () => {
    if (!selectedRelationship) return;

    const confirmed = confirm(
      "Are you sure you want to delete this relationship? This will also delete the reciprocal relationship."
    );

    if (confirmed) {
      const success = await deleteRelationship(selectedRelationship.id);
      if (success) {
        setSelectedRelationship(null); // Go back to list
      }
    }
  };

  // Handle delete relationship from grid
  const handleDeleteRelationship = async (relationshipId: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this relationship? This will also delete the reciprocal relationship."
    );

    if (confirmed) {
      await deleteRelationship(relationshipId);
    }
  };

  // Handle successful relationship creation
  const handleCreateSuccess = () => {
    refetch(); // Refresh the relationships list
  };

  // Handle retry on error
  const handleRetry = () => {
    refetch();
  };

  // Show detail view if relationship selected
  if (selectedRelationship) {
    return (
      <RelationshipDetailView
        relationship={selectedRelationship}
        novelId={novelId}
        characterId={character.id}
        onBack={handleBackFromDetail}
        onEdit={() => {}} // Not used - edit handled internally
        onDelete={handleDeleteFromDetail}
        onUpdate={handleUpdateRelationship}
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

  // Main relationships view
  return (
    <div className="space-y-6">
      {/* Header with stats and add button */}
      <RelationshipsHeader
        character={character}
        relationshipCount={relationships.length}
        onAddRelationship={handleAddRelationship}
        isCreating={isCreating}
      />

      {/* Content - empty state or relationships grid */}
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
