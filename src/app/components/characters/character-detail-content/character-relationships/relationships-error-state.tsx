// app/components/characters/character-detail-content/character-relationships/relationships-error-state.tsx
// Error state for character relationships

import React from "react";
import { Users, RefreshCw } from "lucide-react";
import { Card, CardContent, Button } from "@/app/components/ui";
import type { Character } from "@/lib/characters/character-service";

interface RelationshipsErrorStateProps {
  character: Character;
  error: string;
  onRetry: () => void;
}

export const RelationshipsErrorState: React.FC<
  RelationshipsErrorStateProps
> = ({ character, error, onRetry }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Relationships</h2>
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <Users className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Error Loading Relationships
          </h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button variant="outline" icon={RefreshCw} onClick={onRetry}>
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
