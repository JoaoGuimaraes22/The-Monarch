// app/components/characters/character-detail/character-profile-section.tsx
// Character profile section showing basic information

import React from "react";
import { Edit, MapPin, Users as UsersIcon, BookOpen } from "lucide-react";
import { Card, CardHeader, CardContent, Button } from "@/app/components/ui";

interface CharacterProfileSectionProps {
  character: {
    id: string;
    name: string;
    species: string;
    gender: string | null;
    imageUrl: string | null;
    birthplace: string | null;
    family: string | null;
    baseAppearance: string | null;
    coreNature: string | null;
    inspirations: string;
    writerNotes: string | null;
    tags: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const CharacterProfileSection: React.FC<
  CharacterProfileSectionProps
> = ({ character }) => {
  // Parse JSON fields safely
  const parseJsonField = (field: string | null): any => {
    if (!field || field === "") return null;
    try {
      return JSON.parse(field);
    } catch {
      return null;
    }
  };

  const family = parseJsonField(character.family);
  const baseAppearance = parseJsonField(character.baseAppearance);
  const coreNature = parseJsonField(character.coreNature);
  const inspirations = parseJsonField(character.inspirations) || [];
  const tags = parseJsonField(character.tags) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Character Profile</h2>
          <p className="text-gray-400">
            Complete character information and background
          </p>
        </div>
        <Button variant="outline" icon={Edit}>
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader title="Basic Information" />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
      </div>

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

      {/* Inspirations */}
      {inspirations.length > 0 && (
        <Card>
          <CardHeader title="Inspirations" />
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {inspirations.map((inspiration: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-900/30 text-purple-300 text-sm rounded-full"
                >
                  <BookOpen className="w-3 h-3 inline mr-1" />
                  {inspiration}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader title="Metadata" />
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-400 mb-1">Created</label>
              <p className="text-gray-300">
                {new Date(character.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Last Updated</label>
              <p className="text-gray-300">
                {new Date(character.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
