// app/components/characters/create-character-dialog.tsx
// Dialog for creating new characters

import React, { useState } from "react";
import { Card, CardHeader, CardContent, Button } from "@/app/components/ui";

interface CreateCharacterDialogProps {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    species?: string;
    gender?: string;
    birthplace?: string;
    writerNotes?: string;
  }) => Promise<void>;
}

export const CreateCharacterDialog: React.FC<CreateCharacterDialogProps> = ({
  onClose,
  onCreate,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    species: "Human",
    gender: "",
    birthplace: "",
    writerNotes: "",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Character name is required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await onCreate({
        name: formData.name.trim(),
        species: formData.species || undefined,
        gender: formData.gender || undefined,
        birthplace: formData.birthplace || undefined,
        writerNotes: formData.writerNotes || undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create character"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  // Species options
  const speciesOptions = [
    "Human",
    "Elf",
    "Dwarf",
    "Halfling",
    "Dragon",
    "Fae",
    "Orc",
    "Vampire",
    "Other",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader
          title="Create Character"
          subtitle="Add a new character to your story"
        />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Character Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Character Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter character name"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                required
              />
            </div>

            {/* Species */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Species
              </label>
              <select
                value={formData.species}
                onChange={(e) => handleInputChange("species", e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              >
                {speciesOptions.map((species) => (
                  <option key={species} value={species}>
                    {species}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gender
              </label>
              <input
                type="text"
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                placeholder="e.g. Female, Male, Non-binary"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Birthplace */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Birthplace
              </label>
              <input
                type="text"
                value={formData.birthplace}
                onChange={(e) =>
                  handleInputChange("birthplace", e.target.value)
                }
                placeholder="e.g. Castle Valdris, Northern Kingdoms"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Writer Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.writerNotes}
                onChange={(e) =>
                  handleInputChange("writerNotes", e.target.value)
                }
                placeholder="Character notes, ideas, inspirations..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isCreating || !formData.name.trim()}
              >
                {isCreating ? "Creating..." : "Create Character"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
