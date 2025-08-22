// app/components/characters/characters-stats-bar.tsx
// Statistics bar showing character counts

import React from "react";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui";

interface CharacterStatistics {
  totalCharacters: number;
  povCharacterCount: number;
  primaryCharacters: number;
  secondaryCharacters: number;
}

interface CharactersStatsBarProps {
  statistics: CharacterStatistics;
}

export const CharactersStatsBar: React.FC<CharactersStatsBarProps> = ({
  statistics,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Characters</p>
              <p className="text-2xl font-bold text-white">
                {statistics.totalCharacters}
              </p>
            </div>
            <Users className="w-8 h-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">POV Characters</p>
              <p className="text-2xl font-bold text-white">
                {statistics.povCharacterCount}
              </p>
            </div>
            <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">POV</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Primary</p>
              <p className="text-2xl font-bold text-white">
                {statistics.primaryCharacters}
              </p>
            </div>
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">1°</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Secondary</p>
              <p className="text-2xl font-bold text-white">
                {statistics.secondaryCharacters}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold">2°</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
