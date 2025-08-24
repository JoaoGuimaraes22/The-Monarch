// app/components/characters/character-detail-content/character-detail-page-content.tsx
// Main character detail page content with full editing and state management

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  Character,
  CharacterState,
  CreateCharacterStateOptions,
  CreateCharacterOptions,
  UpdateCharacterStateOptions,
} from "@/lib/characters/";
import {
  useUpdateCharacterState,
  useDeleteCharacterState,
  useCharacterRelationships,
} from "@/hooks/characters";
import {
  CharacterDetailHeader,
  CharacterDetailSidebar,
  CharacterProfileSection,
  CharacterStatesTimeline,
  CharacterManuscriptSection,
  CharacterDetailLoadingState,
  CharacterDetailErrorState,
} from "./index";

import { CharacterRelationshipsSection } from "./character-relationships";
import { CreateCharacterStateDialog } from "./character-state/create-character-state-dialog";
import { EditCharacterDialog } from "./character-profile/edit-character-dialog";

interface CharacterDetailPageContentProps {
  novelId: string;
  characterId: string;
}

export const CharacterDetailPageContent: React.FC<
  CharacterDetailPageContentProps
> = ({ novelId, characterId }) => {
  const router = useRouter();

  // State management hooks
  const { updateState, isUpdating } = useUpdateCharacterState(
    novelId,
    characterId
  );
  const { deleteState, isDeleting } = useDeleteCharacterState(
    novelId,
    characterId
  );

  // Main state
  const [character, setCharacter] = useState<Character | null>(null);
  const [states, setStates] = useState<CharacterState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "states" | "relationships" | "manuscript"
  >("profile");

  // Dialog state
  const [showCreateStateDialog, setShowCreateStateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { relationships } = useCharacterRelationships(novelId, characterId);

  // Fetch character details
  useEffect(() => {
    const fetchCharacterDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch character");
        }

        const data = await response.json();
        setCharacter(data.data.character);
        setStates(data.data.states || []);
      } catch (err) {
        console.error("Error fetching character:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch character"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (novelId && characterId) {
      fetchCharacterDetails();
    }
  }, [novelId, characterId]);

  // Handle back navigation
  const handleBack = () => {
    router.push(`/novels/${novelId}/characters`);
  };

  // Handle character deletion
  const handleDelete = async () => {
    if (!confirm(`Delete ${character?.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/novels/${novelId}/characters/${characterId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete character");
      }

      // Navigate back to characters list
      router.push(`/novels/${novelId}/characters`);
    } catch (err) {
      console.error("Error deleting character:", err);
      alert(err instanceof Error ? err.message : "Failed to delete character");
    }
  };

  // Handle character editing
  const handleEditCharacter = async (
    updates: Partial<CreateCharacterOptions>
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/novels/${novelId}/characters/${characterId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update character");
      }

      const data = await response.json();
      const updatedCharacter = data.data;

      // Update local state
      setCharacter(updatedCharacter);

      return true;
    } catch (err) {
      console.error("Error updating character:", err);
      alert(err instanceof Error ? err.message : "Failed to update character");
      return false;
    }
  };

  // Handle creating character state
  const handleCreateState = async (
    stateData: Omit<CreateCharacterStateOptions, "characterId">
  ): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/novels/${novelId}/characters/${characterId}/states`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...stateData,
            characterId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create character state");
      }

      const data = await response.json();
      const newState = data.data;

      // Add to local state
      setStates((prev) => [...prev, newState]);

      return true;
    } catch (err) {
      console.error("Error creating character state:", err);
      alert(
        err instanceof Error ? err.message : "Failed to create character state"
      );
      return false;
    }
  };

  // Handle updating character state
  const handleUpdateState = async (
    stateId: string,
    updates: UpdateCharacterStateOptions
  ): Promise<CharacterState | null> => {
    try {
      const updatedState = await updateState(stateId, updates);

      if (updatedState) {
        // Update local state
        setStates((prev) =>
          prev.map((state) => (state.id === stateId ? updatedState : state))
        );
      }

      return updatedState;
    } catch (err) {
      console.error("Error updating character state:", err);
      alert(
        err instanceof Error ? err.message : "Failed to update character state"
      );
      return null;
    }
  };

  // Handle deleting character state
  const handleDeleteState = async (stateId: string): Promise<boolean> => {
    try {
      const success = await deleteState(stateId);

      if (success) {
        // Remove from local state
        setStates((prev) => prev.filter((state) => state.id !== stateId));
      }

      return success;
    } catch (err) {
      console.error("Error deleting character state:", err);
      alert(
        err instanceof Error ? err.message : "Failed to delete character state"
      );
      return false;
    }
  };

  // Handle edit button click
  const handleEdit = () => {
    setShowEditDialog(true);
  };

  // Handle add state button click
  const handleAddState = () => {
    setShowCreateStateDialog(true);
  };

  // Loading state
  if (isLoading) {
    return <CharacterDetailLoadingState onBack={handleBack} />;
  }

  // Error state
  if (error || !character) {
    return (
      <CharacterDetailErrorState
        error={error || "Character not found"}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <CharacterDetailHeader
        character={character}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="flex">
        {/* Sidebar Navigation */}
        <CharacterDetailSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          character={character}
          states={states}
          relationshipCount={relationships.length} // ✅ ADD THIS PROP
        />

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "profile" && (
            <CharacterProfileSection character={character} />
          )}

          {activeTab === "states" && (
            <CharacterStatesTimeline
              character={character}
              states={states}
              onAddState={handleAddState}
              onUpdateState={handleUpdateState}
              onDeleteState={handleDeleteState}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          )}

          {activeTab === "relationships" && (
            <CharacterRelationshipsSection
              character={character}
              novelId={novelId}
            />
          )}

          {activeTab === "manuscript" && (
            <CharacterManuscriptSection
              character={character}
              novelId={novelId}
            />
          )}
        </div>
      </div>

      {/* Create Character State Dialog */}
      {showCreateStateDialog && (
        <CreateCharacterStateDialog
          character={character}
          states={states} // ✨ NEW: Pass the states array
          onClose={() => setShowCreateStateDialog(false)}
          onCreate={handleCreateState}
        />
      )}

      {/* Edit Character Dialog */}
      {showEditDialog && character && (
        <EditCharacterDialog
          character={character}
          onClose={() => setShowEditDialog(false)}
          onUpdate={handleEditCharacter}
        />
      )}
    </div>
  );
};
