// app/components/characters/character-detail-content/character-profile/edit-character-dialog.tsx
// UPDATED: Dialog for editing character information with titles support
// Following your established patterns with improved UX

import React, { useState } from "react";
import { X, Crown } from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardContent,
  ArrayField,
  Select,
  ComboSelect,
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

  // ✅ NEW: Initialize character titles
  const [titles, setTitles] = useState<string[]>(
    parseJsonField<string[]>(character.titles) || []
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

  // Predefined options for combo selects
  const speciesOptions = [
    "Human",
    "Elf",
    "Dwarf",
    "Halfling",
    "Dragon",
    "Fae",
    "Orc",
    "Vampire",
    "Demon",
    "Angel",
    "Tiefling",
    "Dragonborn",
    "Gnome",
    "Half-Elf",
    "Half-Orc",
  ];

  const eyeColorOptions = [
    "Brown",
    "Blue",
    "Green",
    "Hazel",
    "Grey",
    "Amber",
    "Black",
    "Violet",
    "Gold",
    "Silver",
    "Red",
  ];

  const hairColorOptions = [
    "Black",
    "Blonde",
    "Brown",
    "White",
    "Grey",
    "Red",
    "Auburn",
    "Strawberry Blonde",
    "Platinum Blonde",
    "Silver",
    "Blue",
    "Green",
    "Purple",
    "Pink",
  ];

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
    "Slayer",
    "Hunter",
    "Seeker",
    "Bearer",
    "Keeper",
    "Warden",
    "Elder",
    "Sage",
    "Oracle",
    "Prophet",
    "Herald",
    "Emissary",
    "Ambassador",
    "Scholar",
    "Artificer",
    "Enchanter",
    "Summoner",
    "Necromancer",
    "Paladin",
    "Templar",
    "Crusader",
    "Knight",
    "Warrior",
    "Assassin",
    "Rogue",
    "Thief",
    "Spy",
    "Scout",
    "Ranger",
    "Druid",
    "Shaman",
    "Priest",
    "Monk",
    "Bard",
    "Minstrel",
    "Merchant",
    "Trader",
    "Smith",
    "Artisan",
    "Healer",
    "Herbalist",
    "Alchemist",
    "Inventor",
    "Engineer",
    "Architect",
    "Builder",
  ];

  // ✨ Predefined options for ArrayField suggestions
  const personalityTraitOptions = [
    "Brave",
    "Intelligent",
    "Kind",
    "Loyal",
    "Stubborn",
    "Curious",
    "Ambitious",
    "Compassionate",
    "Impulsive",
    "Cautious",
    "Creative",
    "Determined",
    "Honest",
    "Mysterious",
    "Charming",
    "Rebellious",
    "Patient",
    "Hot-tempered",
    "Wise",
    "Naive",
    "Confident",
    "Anxious",
    "Optimistic",
    "Pessimistic",
    "Generous",
    "Selfish",
    "Humble",
    "Arrogant",
  ];

  const fearOptions = [
    "Death",
    "Abandonment",
    "Failure",
    "Loss of control",
    "Betrayal",
    "Being alone",
    "Heights",
    "Dark magic",
    "War",
    "Losing loved ones",
    "Being forgotten",
    "Public speaking",
    "Spiders",
    "Fire",
    "Water",
    "Confined spaces",
    "Being judged",
    "Making mistakes",
    "The unknown",
    "Commitment",
    "Change",
    "Intimacy",
    "Rejection",
    "Responsibility",
  ];

  const coreValueOptions = [
    "Justice",
    "Freedom",
    "Family",
    "Honor",
    "Knowledge",
    "Power",
    "Love",
    "Truth",
    "Loyalty",
    "Courage",
    "Wisdom",
    "Compassion",
    "Independence",
    "Tradition",
    "Progress",
    "Peace",
    "Order",
    "Adventure",
    "Revenge",
    "Redemption",
    "Duty",
    "Creativity",
    "Balance",
    "Growth",
    "Security",
    "Achievement",
  ];

  const inspirationOptions = [
    "Literary characters",
    "Historical figures",
    "Mythology",
    "Personal experiences",
    "Dreams",
    "Art",
    "Music",
    "Nature",
    "Other stories",
    "Real people",
    "Philosophy",
    "Religion",
    "Movies",
    "TV shows",
    "Games",
    "Comics",
    "Folklore",
    "Travel",
    "Science",
    "Architecture",
    "Poetry",
  ];

  const tagOptions = [
    "Main Character",
    "Secondary Character",
    "Antagonist",
    "Protagonist",
    "Love Interest",
    "Mentor",
    "Comic Relief",
    "Mysterious",
    "Tragic",
    "Hero",
    "Villain",
    "Anti-hero",
    "Sidekick",
    "Rival",
    "Family",
    "Friend",
    "Enemy",
    "Ally",
    "Neutral",
    "Complex",
    "Evolving",
    "Static",
    "Dynamic",
    "Relatable",
    "Unique",
  ];

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
        titles: titles.length > 0 ? titles : [], // ✅ NEW: Include titles
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

                  {/* Species - ComboSelect with predefined options + custom */}
                  <ComboSelect
                    label="Species"
                    value={formData.species}
                    onChange={(value) =>
                      setFormData({ ...formData, species: value })
                    }
                    options={speciesOptions}
                    placeholder="Choose or type species..."
                    allowCustom={true}
                  />

                  {/* Gender - Regular Select with fixed options */}
                  <Select
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="">Choose gender...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>

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

              {/* ✅ NEW: Character Titles Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2 flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                  Titles & Epithets
                </h3>
                <div className="bg-gray-750 p-4 rounded-lg">
                  <ArrayField
                    label="Character Titles"
                    items={titles}
                    setItems={setTitles}
                    placeholder="Add a title or epithet"
                    maxItems={10}
                    continuousFocus={true}
                    options={titleOptions}
                    allowCustom={true}
                  />

                  {/* Example titles display */}
                  <div className="mt-3 p-3 bg-gray-700 rounded border border-gray-600">
                    <p className="text-xs font-medium text-gray-300 mb-2">
                      Popular Examples:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 text-xs rounded flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        The Ghost
                      </span>
                      <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        Champion of the Collegium
                      </span>
                      <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        Lord Commander
                      </span>
                      <span className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        The Shadowblade
                      </span>
                    </div>
                  </div>
                </div>
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

                  {/* Eye Color - ComboSelect with predefined options + custom */}
                  <ComboSelect
                    label="Eye Color"
                    value={appearanceData.eyeColor}
                    onChange={(value) =>
                      setAppearanceData({
                        ...appearanceData,
                        eyeColor: value,
                      })
                    }
                    options={eyeColorOptions}
                    placeholder="Choose or describe eye color..."
                    allowCustom={true}
                  />

                  {/* Hair Color - ComboSelect with predefined options + custom */}
                  <ComboSelect
                    label="Hair Color"
                    value={appearanceData.hairColor}
                    onChange={(value) =>
                      setAppearanceData({
                        ...appearanceData,
                        hairColor: value,
                      })
                    }
                    options={hairColorOptions}
                    placeholder="Choose or describe hair color..."
                    allowCustom={true}
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

              {/* Personality Arrays - UPDATED with enhanced ArrayField + suggestions */}
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
                    options={personalityTraitOptions}
                    allowCustom={true}
                  />

                  <ArrayField
                    label="Deepest Fears"
                    items={deepestFears}
                    setItems={setDeepestFears}
                    placeholder="Add a deep fear"
                    maxItems={6}
                    continuousFocus={true}
                    options={fearOptions}
                    allowCustom={true}
                  />

                  <ArrayField
                    label="Core Values"
                    items={coreValues}
                    setItems={setCoreValues}
                    placeholder="Add a core value"
                    maxItems={8}
                    continuousFocus={true}
                    options={coreValueOptions}
                    allowCustom={true}
                  />

                  <ArrayField
                    label="Inspirations"
                    items={inspirations}
                    setItems={setInspirations}
                    placeholder="Add an inspiration"
                    maxItems={10}
                    continuousFocus={true}
                    options={inspirationOptions}
                    allowCustom={true}
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
                  options={tagOptions}
                  allowCustom={true}
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
