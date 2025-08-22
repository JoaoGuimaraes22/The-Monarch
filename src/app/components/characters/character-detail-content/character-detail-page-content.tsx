// app/components/characters/character-detail-page-content.tsx
// Main character detail page content

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type {
  Character,
  CharacterState,
} from "@/lib/characters/character-service";
import {
  CharacterDetailHeader,
  CharacterDetailSidebar,
  CharacterProfileSection,
  CharacterStatesTimeline,
  CharacterRelationshipsSection,
  CharacterManuscriptSection,
  CharacterDetailLoadingState,
  CharacterDetailErrorState,
} from "./index";

interface CharacterDetailPageContentProps {
  novelId: string;
  characterId: string;
}

export const CharacterDetailPageContent: React.FC<
  CharacterDetailPageContentProps
> = ({ novelId, characterId }) => {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [states, setStates] = useState<CharacterState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "profile" | "states" | "relationships" | "manuscript"
  >("profile");

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
        onEdit={() => {
          // TODO: Open edit dialog
          console.log("Edit character");
        }}
        onDelete={handleDelete}
      />

      <div className="flex">
        {/* Sidebar Navigation */}
        <CharacterDetailSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          character={character}
          states={states}
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
              onAddState={() => {
                // TODO: Open add state dialog
                console.log("Add state");
              }}
            />
          )}

          {activeTab === "relationships" && (
            <CharacterRelationshipsSection
              character={character}
              onAddRelationship={() => {
                // TODO: Open add relationship dialog
                console.log("Add relationship");
              }}
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
    </div>
  );
};
