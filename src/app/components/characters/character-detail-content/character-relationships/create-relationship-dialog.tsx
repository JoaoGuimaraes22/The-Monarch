// app/components/characters/character-detail-content/character-relationships/create-relationship-dialog.tsx
// Dialog for creating new character relationships with bidirectional support

import React, { useState, useEffect } from "react";
import { X, Users, Heart, UserCheck, Crown, Sword, Eye } from "lucide-react";
import { Button, Input, ComboSelect, Select, Badge } from "@/app/components/ui";
import { useCreateRelationship } from "@/hooks/characters";
import type { Character } from "@/lib/characters/character-service";

interface CreateRelationshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  novelId: string;
  onSuccess?: () => void;
}

// Relationship type options
const RELATIONSHIP_TYPES = [
  { value: "family", label: "Family", icon: Users, color: "text-blue-400" },
  { value: "romantic", label: "Romantic", icon: Heart, color: "text-pink-400" },
  {
    value: "friendship",
    label: "Friendship",
    icon: UserCheck,
    color: "text-green-400",
  },
  {
    value: "mentor_student",
    label: "Mentor/Student",
    icon: Crown,
    color: "text-purple-400",
  },
  {
    value: "professional",
    label: "Professional",
    icon: Eye,
    color: "text-yellow-400",
  },
  {
    value: "antagonistic",
    label: "Antagonistic",
    icon: Sword,
    color: "text-red-400",
  },
];

// Smart reciprocal suggestions
const getReciprocalSuggestions = (
  baseType: string,
  origin?: string
): string[] => {
  const suggestions: Record<string, Record<string, string[]>> = {
    family: {
      default: ["my family member", "my relative", "part of my family"],
      "my little brother": ["my big sister", "my older sister"],
      "my big brother": ["my little sister", "my younger sister"],
      "my little sister": ["my big brother", "my older brother"],
      "my big sister": ["my little brother", "my younger brother"],
      "my father": ["my child", "my daughter", "my son"],
      "my mother": ["my child", "my daughter", "my son"],
      "my child": ["my parent", "my father", "my mother"],
      "my cousin": ["my cousin", "my family member"],
    },
    romantic: {
      default: ["my romantic interest", "my partner", "someone special"],
      "my lover": ["my lover", "my beloved"],
      "my spouse": ["my spouse", "my partner"],
      "my partner": ["my partner", "my beloved"],
      "my secret love": ["my secret love", "my hidden affair"],
    },
    friendship: {
      default: ["my friend", "my companion", "my ally"],
      "my best friend": ["my best friend", "my closest friend"],
      "my childhood friend": ["my childhood friend", "my old friend"],
      "my close friend": ["my close friend", "my dear friend"],
    },
    mentor_student: {
      default: ["my learning partner", "my guide", "my teacher"],
      "my mentor": ["my student", "my pupil", "my apprentice"],
      "my teacher": ["my student", "my pupil"],
      "my guide": ["my follower", "my student"],
      "my student": ["my mentor", "my teacher"],
      "my apprentice": ["my master", "my mentor"],
    },
    professional: {
      default: ["my colleague", "my work contact", "my associate"],
      "my boss": ["my employee", "my subordinate"],
      "my employee": ["my boss", "my supervisor"],
      "my colleague": ["my colleague", "my coworker"],
      "my client": ["my service provider", "my vendor"],
    },
    antagonistic: {
      default: ["my adversary", "my opponent", "my rival"],
      "my enemy": ["my enemy", "my foe"],
      "my rival": ["my rival", "my competitor"],
      "my nemesis": ["my nemesis", "my arch-enemy"],
    },
  };

  const typeMap = suggestions[baseType];
  if (!typeMap) return ["connected person"];

  if (origin) {
    const normalized = origin.toLowerCase().trim();
    return typeMap[normalized] || typeMap.default;
  }

  return typeMap.default;
};

export const CreateRelationshipDialog: React.FC<
  CreateRelationshipDialogProps
> = ({ isOpen, onClose, character, novelId, onSuccess }) => {
  // Form state
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [baseType, setBaseType] = useState<string>("");
  const [origin, setOrigin] = useState<string>("");
  const [reciprocalOrigin, setReciprocalOrigin] = useState<string>("");
  const [history, setHistory] = useState<string>("");
  const [fundamentalDynamic, setFundamentalDynamic] = useState<string>("");
  const [writerNotes, setWriterNotes] = useState<string>("");

  // Available characters
  const [availableCharacters, setAvailableCharacters] = useState<Character[]>(
    []
  );
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);

  // Create relationship hook
  const { createRelationship, isCreating, error, clearError } =
    useCreateRelationship(novelId, character.id);

  // Fetch available characters
  useEffect(() => {
    if (isOpen) {
      fetchAvailableCharacters();
      clearError();
    }
  }, [isOpen, clearError]);

  // Update reciprocal origin when base type or origin changes
  useEffect(() => {
    if (baseType && origin) {
      const suggestions = getReciprocalSuggestions(baseType, origin);
      setReciprocalOrigin(suggestions[0] || "");
    } else if (baseType) {
      const suggestions = getReciprocalSuggestions(baseType);
      setReciprocalOrigin(suggestions[0] || "");
    }
  }, [baseType, origin]);

  const fetchAvailableCharacters = async () => {
    try {
      setIsLoadingCharacters(true);
      const response = await fetch(`/api/novels/${novelId}/characters`);

      if (!response.ok) {
        throw new Error("Failed to fetch characters");
      }

      const data = await response.json();
      // Filter out current character
      const otherCharacters = data.data.characters.filter(
        (char: Character) => char.id !== character.id
      );
      setAvailableCharacters(otherCharacters);
    } catch (err) {
      console.error("Error fetching characters:", err);
    } finally {
      setIsLoadingCharacters(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCharacter || !baseType) {
      return;
    }

    // Extract character ID from the display string
    const selectedCharacterData = availableCharacters.find(
      (char) => char.name === selectedCharacter
    );

    if (!selectedCharacterData) {
      return;
    }

    const result = await createRelationship({
      characterBId: selectedCharacterData.id,
      baseType,
      originFromA: origin || undefined,
      originFromB: reciprocalOrigin || undefined,
      history: history || undefined,
      fundamentalDynamic: fundamentalDynamic || undefined,
      writerNotes: writerNotes || undefined,
      initialState: {
        currentType: baseType,
        strength: 5,
        trustLevel: 5,
        conflictLevel: 1,
        powerBalance: "equal",
        scopeType: "novel",
      },
    });

    if (result) {
      handleClose();
      onSuccess?.();
    }
  };

  const handleClose = () => {
    // Reset form
    setSelectedCharacter("");
    setBaseType("");
    setOrigin("");
    setReciprocalOrigin("");
    setHistory("");
    setFundamentalDynamic("");
    setWriterNotes("");
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  const selectedRelationType = RELATIONSHIP_TYPES.find(
    (type) => type.value === baseType
  );
  const selectedCharacterData = availableCharacters.find(
    (char) => char.name === selectedCharacter
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Create Relationship for {character.name}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Character Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select Character <span className="text-red-400">*</span>
              </label>
              <ComboSelect
                value={selectedCharacter}
                onChange={setSelectedCharacter}
                options={availableCharacters.map((char) => char.name)}
                placeholder={
                  isLoadingCharacters
                    ? "Loading characters..."
                    : "Choose a character..."
                }
                disabled={isLoadingCharacters}
              />
            </div>

            {/* Relationship Type */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Relationship Type <span className="text-red-400">*</span>
              </label>
              <Select
                value={baseType}
                onChange={(e) => setBaseType(e.target.value)}
              >
                <option value="">Select relationship type...</option>
                {RELATIONSHIP_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
              {selectedRelationType && (
                <div className="mt-2 flex items-center space-x-2">
                  <selectedRelationType.icon
                    className={`w-4 h-4 ${selectedRelationType.color}`}
                  />
                  <Badge variant="outline" className="text-xs">
                    {selectedRelationType.label}
                  </Badge>
                </div>
              )}
            </div>

            {/* Origin Perspectives */}
            {baseType && selectedCharacterData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Character's Perspective */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-white border-b border-gray-700 pb-2">
                    {character.name}&#39;s Perspective
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      How does {character.name} see this relationship?
                    </label>
                    <Input
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="e.g., my trusted mentor, my little brother"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Target Character's Perspective */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-white border-b border-gray-700 pb-2">
                    {selectedCharacterData.name}&#39;s Perspective
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      How does {selectedCharacterData.name} likely see this?
                    </label>
                    <Input
                      value={reciprocalOrigin}
                      onChange={(e) => setReciprocalOrigin(e.target.value)}
                      placeholder="Auto-suggested reciprocal"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-suggested based on relationship type. Can be
                      customized.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-white border-b border-gray-700 pb-2">
                Additional Details (Optional)
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  History
                </label>
                <textarea
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  placeholder="Background of how this relationship formed..."
                  className="w-full h-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fundamental Dynamic
                </label>
                <Input
                  value={fundamentalDynamic}
                  onChange={(e) => setFundamentalDynamic(e.target.value)}
                  placeholder="Core pattern that doesn't change..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Writer Notes
                </label>
                <textarea
                  value={writerNotes}
                  onChange={(e) => setWriterNotes(e.target.value)}
                  placeholder="Private notes about this relationship..."
                  className="w-full h-16 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedCharacter || !baseType || isCreating}
            >
              {isCreating ? "Creating..." : "Create Relationship"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
