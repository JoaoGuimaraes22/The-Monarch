// app/components/characters/character-detail/character-manuscript-section.tsx
// Character manuscript integration section

import React from "react";
import { Card, CardHeader, CardContent } from "@/app/components/ui";

export const CharacterManuscriptSection: React.FC<{
  character: any;
  novelId: string;
}> = ({ character, novelId }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Manuscript Integration
        </h2>
        <p className="text-gray-400">
          See where {character.name} appears in your story
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="POV Scenes" />
          <CardContent className="text-center py-8">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <p className="text-gray-400">
              Scenes from {character.name}'s perspective
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Total Appearances" />
          <CardContent className="text-center py-8">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <p className="text-gray-400">
              Scenes where {character.name} appears
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Scene Appearances" />
        <CardContent className="text-center py-12">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-lg font-semibold text-gray-300">
              {character.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Scene Data</h3>
          <p className="text-gray-400">
            Scene appearance data will appear here once {character.name} is used
            in your manuscript.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
