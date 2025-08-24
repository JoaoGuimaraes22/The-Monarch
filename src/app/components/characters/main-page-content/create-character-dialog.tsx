// app/components/characters/main-page-content/create-character-dialog.tsx
// Updated dialog for creating new characters with titles support

import React, { useState } from "react";
import { Crown } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Select,
  ArrayField,
} from "@/app/components/ui";

interface CreateCharacterDialogProps {
  onClose: () => void;
  onCreate: (data: {
    name: string;
    species?: string;
    gender?: string;
    birthplace?: string;
    titles?: string[]; // ✅ NEW: Add titles support
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

  // ✅ NEW: Add titles state
  const [titles, setTitles] = useState<string[]>([]);

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ NEW: Predefined title options for suggestions
  const titleOptions = [
    "The Ghost",
    "The Shadow",
    "The Blade",
    "The Wolf",
    "The Dragon",
    "The Phoenix",
    "The Raven",
    "The Storm",
    "The Iron",
    "The Swift",
    "The Wise",
    "The Bold",
    "The Silent",
    "The Dark",
    "The Bright",
    "Lord",
    "Lady",
    "Sir",
    "Dame",
    "King",
    "Queen",
    "Prince",
    "Princess",
    "Duke",
    "Duchess",
    "Count",
    "Countess",
    "Captain",
    "Commander",
    "General",
    "Admiral",
    "Master",
    "Mistress",
    "Champion",
    "Defender",
    "Protector",
    "Guardian",
    "Knight",
    "Warrior",
    "Scholar",
    "Sage",
    "Elder",
    "Artificer",
    "Paladin",
    "Ranger",
    "Bard",
    "Merchant",
    "Smith",
    "Healer",
  ];

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
        titles: titles.length > 0 ? titles : undefined, // ✅ NEW: Include titles
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
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader
          title="Create Character"
          subtitle="Add a new character to your story"
        />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* ✅ NEW: Character Titles Section */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                Titles & Epithets
              </h4>
              <div className="bg-gray-750 p-3 rounded-lg border border-gray-600">
                <ArrayField
                  label=""
                  items={titles}
                  setItems={setTitles}
                  placeholder="Add a title (Lord, Captain, The Ghost, etc.)"
                  maxItems={5}
                  continuousFocus={true}
                  options={titleOptions}
                  allowCustom={true}
                />

                {/* Helpful examples */}
                <div className="mt-2 p-2 bg-gray-700 rounded border border-gray-600">
                  <p className="text-xs text-gray-400 mb-1">
                    Popular Examples:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded">
                      The Ghost
                    </span>
                    <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded">
                      Lord Commander
                    </span>
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">
                      Captain
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Species */}
            <Select
              label="Species"
              value={formData.species}
              onChange={(e) => handleInputChange("species", e.target.value)}
            >
              {speciesOptions.map((species) => (
                <option key={species} value={species}>
                  {species}
                </option>
              ))}
            </Select>

            {/* Gender - Now a dropdown */}
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
            >
              <option value="">Choose gender...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Select>

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
