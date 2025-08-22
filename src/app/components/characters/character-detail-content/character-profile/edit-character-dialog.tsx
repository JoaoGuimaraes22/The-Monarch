// app/components/characters/character-detail-content/character-profile/edit-character-dialog.tsx
// UPDATED: Dialog for editing character information with fixed layout and enhanced ArrayField
// Following your established patterns with improved UX

import React, { useState } from "react";
import { X } from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardContent,
  ArrayField,
} from "@/app/components/ui";
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-gray-800 border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Character</h2>
            <p className="text-sm text-gray-400 mt-1">
              Update {character.name}&#39;s information
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Name *"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Character name"
                    maxLength={255}
                    required
                  />

                  <Input
                    label="Species"
                    value={formData.species}
                    onChange={(e) =>
                      setFormData({ ...formData, species: e.target.value })
                    }
                    placeholder="Human, Elf, Dwarf, etc."
                    maxLength={100}
                  />

                  <Input
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    placeholder="Male, Female, Non-binary, etc."
                    maxLength={50}
                  />

                  <Input
                    label="Birthplace"
                    value={formData.birthplace}
                    onChange={(e) =>
                      setFormData({ ...formData, birthplace: e.target.value })
                    }
                    placeholder="Place of birth"
                    maxLength={255}
                  />
                </div>

                <Input
                  label="Image URL"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/character-image.jpg"
                />
              </div>

              {/* Family Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Family & Heritage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Parents"
                    value={familyData.parents}
                    onChange={(e) =>
                      setFamilyData({ ...familyData, parents: e.target.value })
                    }
                    placeholder="Parent names and information"
                  />

                  <Input
                    label="Siblings"
                    value={familyData.siblings}
                    onChange={(e) =>
                      setFamilyData({ ...familyData, siblings: e.target.value })
                    }
                    placeholder="Sibling names and information"
                  />
                </div>

                <Input
                  label="Heritage"
                  value={familyData.heritage}
                  onChange={(e) =>
                    setFamilyData({ ...familyData, heritage: e.target.value })
                  }
                  placeholder="Cultural background, lineage, etc."
                />
              </div>

              {/* Physical Appearance */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Physical Appearance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Height"
                    value={appearanceData.height}
                    onChange={(e) =>
                      setAppearanceData({
                        ...appearanceData,
                        height: e.target.value,
                      })
                    }
                    placeholder="5'8, tall, short, etc."
                  />

                  <Input
                    label="Eye Color"
                    value={appearanceData.eyeColor}
                    onChange={(e) =>
                      setAppearanceData({
                        ...appearanceData,
                        eyeColor: e.target.value,
                      })
                    }
                    placeholder="Blue, brown, green, etc."
                  />

                  <Input
                    label="Hair Color"
                    value={appearanceData.hairColor}
                    onChange={(e) =>
                      setAppearanceData({
                        ...appearanceData,
                        hairColor: e.target.value,
                      })
                    }
                    placeholder="Blonde, brunette, red, etc."
                  />

                  <Input
                    label="Distinguishing Marks"
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

              {/* Personality Arrays - UPDATED with enhanced ArrayField */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Core Personality
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ArrayField
                    label="Fundamental Traits"
                    items={fundamentalTraits}
                    setItems={setFundamentalTraits}
                    placeholder="Add a core personality trait"
                    maxItems={8}
                    continuousFocus={true}
                  />

                  <ArrayField
                    label="Deepest Fears"
                    items={deepestFears}
                    setItems={setDeepestFears}
                    placeholder="Add a deep fear"
                    maxItems={6}
                    continuousFocus={true}
                  />

                  <ArrayField
                    label="Core Values"
                    items={coreValues}
                    setItems={setCoreValues}
                    placeholder="Add a core value"
                    maxItems={8}
                    continuousFocus={true}
                  />

                  <ArrayField
                    label="Inspirations"
                    items={inspirations}
                    setItems={setInspirations}
                    placeholder="Add an inspiration"
                    maxItems={10}
                    continuousFocus={true}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Organization
                </h3>
                <ArrayField
                  label="Tags"
                  items={tags}
                  setItems={setTags}
                  placeholder="Add a tag or category"
                  maxItems={15}
                  continuousFocus={true}
                />
              </div>

              {/* Writer Notes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Notes
                </h3>
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
              </div>
            </form>
          </CardContent>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim()}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Updating..." : "Update Character"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
