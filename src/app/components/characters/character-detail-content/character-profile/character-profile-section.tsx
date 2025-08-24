// app/components/characters/character-detail-content/character-profile-section.tsx
// Character profile section showing basic information (updated with titles support)

import React from "react";
import { MapPin, BookOpen, Crown } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/app/components/ui";
import type { Character } from "@/lib/characters/character-service";

// Define proper types for JSON fields
interface FamilyData {
  parents?: string;
  siblings?: string;
  heritage?: string;
}

interface BaseAppearanceData {
  height?: string;
  eyeColor?: string;
  hairColor?: string;
  distinguishingMarks?: string;
}

interface CoreNatureData {
  fundamentalTraits?: string[];
  deepestFears?: string[];
  coreValues?: string[];
}

interface CharacterProfileSectionProps {
  character: Character;
}

export const CharacterProfileSection: React.FC<
  CharacterProfileSectionProps
> = ({ character }) => {
  // Parse JSON fields safely with proper typing
  const parseJsonField = <T,>(field: string | null): T | null => {
    if (!field || field === "") return null;
    try {
      return JSON.parse(field) as T;
    } catch {
      return null;
    }
  };

  const family = parseJsonField<FamilyData>(character.family);
  const baseAppearance = parseJsonField<BaseAppearanceData>(
    character.baseAppearance
  );
  const coreNature = parseJsonField<CoreNatureData>(character.coreNature);
  const inspirations = parseJsonField<string[]>(character.inspirations) || [];
  const tags = parseJsonField<string[]>(character.tags) || [];

  // ✅ NEW: Parse character titles
  const titles = parseJsonField<string[]>(character.titles) || [];

  return (
    <div className="space-y-6">
      {/* Page Header - No edit button since header already has one */}
      <div>
        <h2 className="text-2xl font-bold text-white">Character Profile</h2>
        <p className="text-gray-400">
          Complete character information and background
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader title="Basic Information" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Name
                </label>
                <p className="text-white">{character.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Species
                </label>
                <p className="text-white">{character.species}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Gender
                </label>
                <p className="text-white">
                  {character.gender || "Not specified"}
                </p>
              </div>
            </div>

            {character.birthplace && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Birthplace
                </label>
                <p className="text-white">{character.birthplace}</p>
              </div>
            )}

            {/* ✅ NEW: Display Character Titles */}
            {titles.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  <Crown className="w-4 h-4 inline mr-1" />
                  Titles & Epithets
                </label>
                <div className="flex flex-wrap gap-2">
                  {titles.map((title: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-yellow-900/30 text-yellow-300 text-sm rounded-full flex items-center border border-yellow-500/20"
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      {title}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  These titles are used for smart mention detection in your
                  manuscript.
                </p>
              </div>
            )}

            {tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Family & Background */}
        {family && (
          <Card>
            <CardHeader title="Family & Heritage" />
            <CardContent className="space-y-3">
              {family.parents && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Parents
                  </label>
                  <p className="text-white">{family.parents}</p>
                </div>
              )}
              {family.siblings && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Siblings
                  </label>
                  <p className="text-white">{family.siblings}</p>
                </div>
              )}
              {family.heritage && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Heritage
                  </label>
                  <p className="text-white">{family.heritage}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Physical Appearance */}
        {baseAppearance && (
          <Card>
            <CardHeader title="Physical Appearance" />
            <CardContent className="space-y-3">
              {baseAppearance.height && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Height
                  </label>
                  <p className="text-white">{baseAppearance.height}</p>
                </div>
              )}
              {baseAppearance.eyeColor && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Eye Color
                  </label>
                  <p className="text-white">{baseAppearance.eyeColor}</p>
                </div>
              )}
              {baseAppearance.hairColor && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Hair Color
                  </label>
                  <p className="text-white">{baseAppearance.hairColor}</p>
                </div>
              )}
              {baseAppearance.distinguishingMarks && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Distinguishing Marks
                  </label>
                  <p className="text-white">
                    {baseAppearance.distinguishingMarks}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Core Nature & Personality */}
        {coreNature && (
          <Card>
            <CardHeader title="Core Nature & Personality" />
            <CardContent className="space-y-3">
              {coreNature.fundamentalTraits &&
                Array.isArray(coreNature.fundamentalTraits) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Fundamental Traits
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {coreNature.fundamentalTraits.map(
                        (trait: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-900/30 text-blue-300 text-sm rounded"
                          >
                            {trait}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              {coreNature.deepestFears &&
                Array.isArray(coreNature.deepestFears) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Deepest Fears
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {coreNature.deepestFears.map(
                        (fear: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-red-900/30 text-red-300 text-sm rounded"
                          >
                            {fear}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              {coreNature.coreValues &&
                Array.isArray(coreNature.coreValues) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Core Values
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {coreNature.coreValues.map(
                        (value: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-900/30 text-green-300 text-sm rounded"
                          >
                            {value}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Inspirations */}
        {inspirations.length > 0 && (
          <Card>
            <CardHeader title="Inspirations" />
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {inspirations.map((inspiration: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-amber-900/30 text-amber-300 text-sm rounded-full flex items-center"
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    {inspiration}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Writer Notes */}
        {character.writerNotes && (
          <Card>
            <CardHeader title="Writer Notes" />
            <CardContent>
              <p className="text-gray-300 whitespace-pre-wrap">
                {character.writerNotes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
