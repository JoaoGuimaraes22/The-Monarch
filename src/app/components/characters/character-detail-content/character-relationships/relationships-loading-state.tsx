// app/components/characters/character-detail-content/character-relationships/relationships-loading-state.tsx
// Loading state for character relationships

import React from "react";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui";
import type { Character } from "@/lib/characters/character-service";

interface RelationshipsLoadingStateProps {
  character: Character;
}

export const RelationshipsLoadingState: React.FC<
  RelationshipsLoadingStateProps
> = ({ character }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Relationships</h2>
          <p className="text-gray-400">Loading relationships...</p>
        </div>
        <div className="animate-pulse">
          <div className="h-10 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-pulse">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <div className="h-6 w-48 bg-gray-700 rounded mx-auto mb-2"></div>
            <div className="h-4 w-64 bg-gray-700 rounded mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
