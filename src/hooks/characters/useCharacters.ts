// hooks/characters/useCharacters.ts
// Character management hooks following your established patterns

import { useState, useEffect, useCallback } from "react";
import {
  Character,
  CharacterWithCurrentState,
  CreateCharacterOptions,
  characterService,
} from "@/lib/characters/character-service";

// ===== TYPES =====
interface UseCharactersReturn {
  // State
  characters: CharacterWithCurrentState[];
  selectedCharacter: Character | null;
  statistics: {
    totalCharacters: number;
    povCharacterCount: number;
    primaryCharacters: number;
    secondaryCharacters: number;
  } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createCharacter: (
    options: CreateCharacterOptions
  ) => Promise<Character | null>;
  updateCharacter: (
    characterId: string,
    options: Partial<CreateCharacterOptions>
  ) => Promise<Character | null>;
  deleteCharacter: (characterId: string) => Promise<boolean>;
  selectCharacter: (characterId: string) => Promise<void>;
  clearSelection: () => void;
  refreshCharacters: () => Promise<void>;

  // Utilities
  getCharacterById: (characterId: string) => CharacterWithCurrentState | null;
  isCharacterNameUnique: (name: string, excludeId?: string) => boolean;
}

// ===== MAIN HOOK =====
export function useCharacters(novelId: string): UseCharactersReturn {
  // State
  const [characters, setCharacters] = useState<CharacterWithCurrentState[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [statistics, setStatistics] = useState<{
    totalCharacters: number;
    povCharacterCount: number;
    primaryCharacters: number;
    secondaryCharacters: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ===== FETCH CHARACTERS =====
  const fetchCharacters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/novels/${novelId}/characters`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch characters");
      }

      const data = await response.json();
      setCharacters(data.data.characters);
      setStatistics(data.data.stats);
    } catch (err) {
      console.error("Error fetching characters:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch characters"
      );
    } finally {
      setIsLoading(false);
    }
  }, [novelId]);

  // ===== FETCH SELECTED CHARACTER =====
  const fetchCharacterDetails = useCallback(
    async (characterId: string) => {
      try {
        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch character details"
          );
        }

        const data = await response.json();
        setSelectedCharacter(data.data.character);
      } catch (err) {
        console.error("Error fetching character details:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch character details"
        );
      }
    },
    [novelId]
  );

  // ===== CREATE CHARACTER =====
  const createCharacter = useCallback(
    async (options: CreateCharacterOptions): Promise<Character | null> => {
      try {
        setError(null);

        const response = await fetch(`/api/novels/${novelId}/characters`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(options),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create character");
        }

        const data = await response.json();
        const newCharacter = data.data;

        // Add to local state
        setCharacters((prev) =>
          [
            ...prev,
            {
              ...newCharacter,
              currentState: null,
              povSceneCount: 0,
            },
          ].sort((a, b) => a.name.localeCompare(b.name))
        );

        // Update statistics
        setStatistics((prev) =>
          prev
            ? {
                ...prev,
                totalCharacters: prev.totalCharacters + 1,
              }
            : null
        );

        return newCharacter;
      } catch (err) {
        console.error("Error creating character:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create character"
        );
        return null;
      }
    },
    [novelId]
  );

  // ===== UPDATE CHARACTER =====
  const updateCharacter = useCallback(
    async (
      characterId: string,
      options: Partial<CreateCharacterOptions>
    ): Promise<Character | null> => {
      try {
        setError(null);

        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(options),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update character");
        }

        const data = await response.json();
        const updatedCharacter = data.data;

        // Update local state
        setCharacters((prev) =>
          prev
            .map((char) =>
              char.id === characterId ? { ...char, ...updatedCharacter } : char
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        );

        // Update selected character if it's the one being updated
        if (selectedCharacter?.id === characterId) {
          setSelectedCharacter(updatedCharacter);
        }

        return updatedCharacter;
      } catch (err) {
        console.error("Error updating character:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update character"
        );
        return null;
      }
    },
    [novelId, selectedCharacter?.id]
  );

  // ===== DELETE CHARACTER =====
  const deleteCharacter = useCallback(
    async (characterId: string): Promise<boolean> => {
      try {
        setError(null);

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

        // Remove from local state
        setCharacters((prev) => prev.filter((char) => char.id !== characterId));

        // Clear selection if deleted character was selected
        if (selectedCharacter?.id === characterId) {
          setSelectedCharacter(null);
        }

        // Update statistics
        setStatistics((prev) =>
          prev
            ? {
                ...prev,
                totalCharacters: prev.totalCharacters - 1,
              }
            : null
        );

        return true;
      } catch (err) {
        console.error("Error deleting character:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete character"
        );
        return false;
      }
    },
    [novelId, selectedCharacter?.id]
  );

  // ===== SELECT CHARACTER =====
  const selectCharacter = useCallback(
    async (characterId: string) => {
      await fetchCharacterDetails(characterId);
    },
    [fetchCharacterDetails]
  );

  // ===== CLEAR SELECTION =====
  const clearSelection = useCallback(() => {
    setSelectedCharacter(null);
  }, []);

  // ===== REFRESH CHARACTERS =====
  const refreshCharacters = useCallback(async () => {
    await fetchCharacters();
  }, [fetchCharacters]);

  // ===== UTILITY FUNCTIONS =====
  const getCharacterById = useCallback(
    (characterId: string): CharacterWithCurrentState | null => {
      return characters.find((char) => char.id === characterId) || null;
    },
    [characters]
  );

  const isCharacterNameUnique = useCallback(
    (name: string, excludeId?: string): boolean => {
      return !characters.some(
        (char) =>
          char.name.toLowerCase() === name.toLowerCase() &&
          char.id !== excludeId
      );
    },
    [characters]
  );

  // ===== INITIAL LOAD =====
  useEffect(() => {
    if (novelId) {
      fetchCharacters();
    }
  }, [novelId, fetchCharacters]);

  return {
    // State
    characters,
    selectedCharacter,
    statistics,
    isLoading,
    error,

    // Actions
    createCharacter,
    updateCharacter,
    deleteCharacter,
    selectCharacter,
    clearSelection,
    refreshCharacters,

    // Utilities
    getCharacterById,
    isCharacterNameUnique,
  };
}

// ===== CHARACTER SUGGESTIONS HOOK =====
// For POV character selection in manuscript editor
export function useCharacterSuggestions(novelId: string) {
  const [suggestions, setSuggestions] = useState<
    Array<{
      id: string;
      name: string;
      imageUrl: string | null;
      species: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchCharacters = useCallback(
    async (searchTerm: string = "") => {
      if (!novelId) return;

      try {
        setIsLoading(true);

        const url = new URL(
          `/api/novels/${novelId}/characters`,
          window.location.origin
        );
        if (searchTerm) {
          url.searchParams.set("search", searchTerm);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error("Failed to fetch character suggestions");
        }

        const data = await response.json();
        setSuggestions(
          data.data.characters.map((char: Character) => ({
            id: char.id,
            name: char.name,
            imageUrl: char.imageUrl,
            species: char.species,
          }))
        );
      } catch (err) {
        console.error("Error fetching character suggestions:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [novelId]
  );

  useEffect(() => {
    searchCharacters();
  }, [searchCharacters]);

  return {
    suggestions,
    isLoading,
    searchCharacters,
  };
}
