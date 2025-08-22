// app/components/characters/character-detail-content/edit-character-dialog.tsx
// Dialog for editing character information

import React, { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/app/components/ui";
import type {
  Character,
  CreateCharacterOptions,
} from "@/lib/characters/character-service";

interface EditCharacterDialogProps {
  character: Character;
  onClose: () => void;
  onUpdate: (updates: Partial<CreateCharacterOptions>) => Promise<boolean>;
}

export const EditCharacterDialog: React.FC<EditCharacterDialogProps> = ({
  character,
  onClose,
  onUpdate,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse JSON fields safely for initial state
  const parseJsonField = <T,>(field: string | null): T | null => {
    if (!field || field === "") return null;
    try {
      return JSON.parse(field) as T;
    } catch {
      return null;
    }
  };

  // Initialize form data with current character values
  const [formData, setFormData] = useState({
    name: character.name,
    species: character.species,
    gender: character.gender || "",
    imageUrl: character.imageUrl || "",
    birthplace: character.birthplace || "",
    writerNotes: character.writerNotes || "",
  });

  // Initialize complex fields
  const [inspirations, setInspirations] = useState<string[]>(
    parseJsonField<string[]>(character.inspirations) || []
  );
  const [tags, setTags] = useState<string[]>(
    parseJsonField<string[]>(character.tags) || []
  );

  // Family data
  const initialFamily =
    parseJsonField<{
      parents?: string;
      siblings?: string;
      heritage?: string;
    }>(character.family) || {};

  const [familyData, setFamilyData] = useState({
    parents: initialFamily.parents || "",
    siblings: initialFamily.siblings || "",
    heritage: initialFamily.heritage || "",
  });

  // Base appearance data
  const initialAppearance =
    parseJsonField<{
      height?: string;
      eyeColor?: string;
      hairColor?: string;
      distinguishingMarks?: string;
    }>(character.baseAppearance) || {};

  const [appearanceData, setAppearanceData] = useState({
    height: initialAppearance.height || "",
    eyeColor: initialAppearance.eyeColor || "",
    hairColor: initialAppearance.hairColor || "",
    distinguishingMarks: initialAppearance.distinguishingMarks || "",
  });

  // Core nature data
  const initialNature =
    parseJsonField<{
      fundamentalTraits?: string[];
      deepestFears?: string[];
      coreValues?: string[];
    }>(character.coreNature) || {};

  const [fundamentalTraits, setFundamentalTraits] = useState<string[]>(
    initialNature.fundamentalTraits || []
  );
  const [deepestFears, setDeepestFears] = useState<string[]>(
    initialNature.deepestFears || []
  );
  const [coreValues, setCoreValues] = useState<string[]>(
    initialNature.coreValues || []
  );

  // Array helpers
  const addArrayItem = (
    array: string[],
    setter: (items: string[]) => void,
    newItem: string
  ) => {
    if (newItem.trim() && !array.includes(newItem.trim())) {
      setter([...array, newItem.trim()]);
    }
  };

  const removeArrayItem = (
    array: string[],
    setter: (items: string[]) => void,
    index: number
  ) => {
    setter(array.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build family object (only include non-empty fields)
      const family: Record<string, string> = {};
      if (familyData.parents.trim()) family.parents = familyData.parents.trim();
      if (familyData.siblings.trim())
        family.siblings = familyData.siblings.trim();
      if (familyData.heritage.trim())
        family.heritage = familyData.heritage.trim();

      // Build appearance object (only include non-empty fields)
      const baseAppearance: Record<string, string> = {};
      if (appearanceData.height.trim())
        baseAppearance.height = appearanceData.height.trim();
      if (appearanceData.eyeColor.trim())
        baseAppearance.eyeColor = appearanceData.eyeColor.trim();
      if (appearanceData.hairColor.trim())
        baseAppearance.hairColor = appearanceData.hairColor.trim();
      if (appearanceData.distinguishingMarks.trim()) {
        baseAppearance.distinguishingMarks =
          appearanceData.distinguishingMarks.trim();
      }

      // Build core nature object (only include non-empty arrays)
      const coreNature: Record<string, string[]> = {};
      if (fundamentalTraits.length > 0)
        coreNature.fundamentalTraits = fundamentalTraits;
      if (deepestFears.length > 0) coreNature.deepestFears = deepestFears;
      if (coreValues.length > 0) coreNature.coreValues = coreValues;

      const updates: Partial<CreateCharacterOptions> = {
        name: formData.name.trim(),
        species: formData.species.trim(),
        gender: formData.gender.trim() || null,
        imageUrl: formData.imageUrl.trim() || null,
        birthplace: formData.birthplace.trim() || null,
        writerNotes: formData.writerNotes.trim() || null,
        inspirations: inspirations.length > 0 ? inspirations : [],
        tags: tags.length > 0 ? tags : [],
        family: Object.keys(family).length > 0 ? family : null,
        baseAppearance:
          Object.keys(baseAppearance).length > 0 ? baseAppearance : null,
        coreNature: Object.keys(coreNature).length > 0 ? coreNature : null,
      };

      const success = await onUpdate(updates);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating character:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reusable array field component
  const ArrayField = ({
    label,
    items,
    setItems,
    placeholder,
    maxItems = 10,
  }: {
    label: string;
    items: string[];
    setItems: (items: string[]) => void;
    placeholder: string;
    maxItems?: number;
  }) => {
    const [newItem, setNewItem] = useState("");

    return (
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {label}{" "}
          {items.length > 0 && (
            <span className="text-gray-500">({items.length})</span>
          )}
        </label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 text-sm rounded border border-gray-600">
                {item}
              </span>
              <button
                type="button"
                onClick={() => removeArrayItem(items, setItems, index)}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items.length < maxItems && (
            <div className="flex items-center space-x-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={placeholder}
                className="flex-1"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem(items, setItems, newItem);
                    setNewItem("");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  addArrayItem(items, setItems, newItem);
                  setNewItem("");
                }}
                disabled={!newItem.trim()}
                className="p-2 text-green-400 hover:text-green-300 disabled:text-gray-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-white">Edit Character</h2>
              <p className="text-sm text-gray-400">
                Update {character.name}&#39;s information
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Character name"
                  maxLength={255}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Species
                </label>
                <Input
                  value={formData.species}
                  onChange={(e) =>
                    setFormData({ ...formData, species: e.target.value })
                  }
                  placeholder="Human, Elf, Dwarf, etc."
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Gender
                </label>
                <Input
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  placeholder="Male, Female, Non-binary, etc."
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Birthplace
                </label>
                <Input
                  value={formData.birthplace}
                  onChange={(e) =>
                    setFormData({ ...formData, birthplace: e.target.value })
                  }
                  placeholder="Place of birth"
                  maxLength={255}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Image URL
                </label>
                <Input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/character-image.jpg"
                />
              </div>
            </div>

            {/* Family Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Family & Heritage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Parents
                  </label>
                  <Input
                    value={familyData.parents}
                    onChange={(e) =>
                      setFamilyData({ ...familyData, parents: e.target.value })
                    }
                    placeholder="Parent names and information"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Siblings
                  </label>
                  <Input
                    value={familyData.siblings}
                    onChange={(e) =>
                      setFamilyData({ ...familyData, siblings: e.target.value })
                    }
                    placeholder="Sibling names and information"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Heritage
                  </label>
                  <Input
                    value={familyData.heritage}
                    onChange={(e) =>
                      setFamilyData({ ...familyData, heritage: e.target.value })
                    }
                    placeholder="Cultural background, lineage, etc."
                  />
                </div>
              </div>
            </div>

            {/* Physical Appearance */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Physical Appearance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Height
                  </label>
                  <Input
                    value={appearanceData.height}
                    onChange={(e) =>
                      setAppearanceData({
                        ...appearanceData,
                        height: e.target.value,
                      })
                    }
                    placeholder="5'8\', tall, short, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Eye Color
                  </label>
                  <Input
                    value={appearanceData.eyeColor}
                    onChange={(e) =>
                      setAppearanceData({
                        ...appearanceData,
                        eyeColor: e.target.value,
                      })
                    }
                    placeholder="Blue, brown, green, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Hair Color
                  </label>
                  <Input
                    value={appearanceData.hairColor}
                    onChange={(e) =>
                      setAppearanceData({
                        ...appearanceData,
                        hairColor: e.target.value,
                      })
                    }
                    placeholder="Blonde, brunette, red, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Distinguishing Marks
                  </label>
                  <Input
                    value={appearanceData.distinguishingMarks}
                    onChange={(e) =>
                      setAppearanceData({
                        ...appearanceData,
                        distinguishingMarks: e.target.value,
                      })
                    }
                    placeholder="Scars, tattoos, birthmarks, etc."
                  />
                </div>
              </div>
            </div>

            {/* Personality Arrays */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ArrayField
                label="Fundamental Traits"
                items={fundamentalTraits}
                setItems={setFundamentalTraits}
                placeholder="Add a core personality trait"
                maxItems={8}
              />

              <ArrayField
                label="Deepest Fears"
                items={deepestFears}
                setItems={setDeepestFears}
                placeholder="Add a deep fear"
                maxItems={6}
              />

              <ArrayField
                label="Core Values"
                items={coreValues}
                setItems={setCoreValues}
                placeholder="Add a core value"
                maxItems={8}
              />

              <div>
                <ArrayField
                  label="Inspirations"
                  items={inspirations}
                  setItems={setInspirations}
                  placeholder="Add an inspiration"
                  maxItems={10}
                />
              </div>
            </div>

            {/* Tags */}
            <ArrayField
              label="Tags"
              items={tags}
              setItems={setTags}
              placeholder="Add a tag or category"
              maxItems={15}
            />

            {/* Writer Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Writer Notes
              </label>
              <textarea
                value={formData.writerNotes}
                onChange={(e) =>
                  setFormData({ ...formData, writerNotes: e.target.value })
                }
                placeholder="Private notes about this character..."
                className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                maxLength={2000}
              />
              {formData.writerNotes && (
                <p className="text-xs text-gray-500 mt-1">
                  {formData.writerNotes.length}/2000 characters
                </p>
              )}
            </div>
          </CardContent>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !formData.name.trim()}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Updating..." : "Update Character"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
