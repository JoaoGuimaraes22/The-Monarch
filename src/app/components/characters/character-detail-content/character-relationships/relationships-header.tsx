// app/components/characters/character-detail-content/character-relationships/relationships-header.tsx
// Header section for character relationships

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui";
import type { Character } from "@/lib/characters/character-service";

interface RelationshipsHeaderProps {
  character: Character;
  relationshipCount: number;
  onAddRelationship: () => void;
  isCreating?: boolean;
}

export const RelationshipsHeader: React.FC<RelationshipsHeaderProps> = ({
  character,
  relationshipCount,
  onAddRelationship,
  isCreating = false,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white">Relationships</h2>
        <p className="text-gray-400">
          {relationshipCount === 0
            ? `Manage ${character.name}'s connections with other characters`
            : `${character.name} has ${relationshipCount} relationship${
                relationshipCount !== 1 ? "s" : ""
              }`}
        </p>
      </div>
      <Button
        variant="primary"
        icon={Plus}
        onClick={onAddRelationship}
        disabled={isCreating}
      >
        {isCreating ? "Creating..." : "Add Relationship"}
      </Button>
    </div>
  );
};
