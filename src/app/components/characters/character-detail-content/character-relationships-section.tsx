// app/components/characters/character-detail-content/character-relationships-section.tsx
// Character relationships section

import React from "react";
import { Plus, Users } from "lucide-react";
import { Card, CardContent, Button } from "@/app/components/ui";
import type { Character } from "@/lib/characters/character-service";

interface CharacterRelationshipsSectionProps {
  character: Character;
  onAddRelationship: () => void;
}

export const CharacterRelationshipsSection: React.FC<
  CharacterRelationshipsSectionProps
> = ({ character, onAddRelationship }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Relationships</h2>
          <p className="text-gray-400">
            Manage {character.name}&#39;s connections with other characters
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={onAddRelationship}>
          Add Relationship
        </Button>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No Relationships
          </h3>
          <p className="text-gray-400 mb-4">
            Create relationships to track {character.name}&#39;s connections
            with other characters.
          </p>
          <Button variant="outline" icon={Plus} onClick={onAddRelationship}>
            Create First Relationship
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
