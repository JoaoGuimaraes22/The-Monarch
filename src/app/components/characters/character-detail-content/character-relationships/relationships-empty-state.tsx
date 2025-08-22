// app/components/characters/character-detail-content/character-relationships/relationships-empty-state.tsx
// Empty state for when character has no relationships

import React from "react";
import { Plus, Users } from "lucide-react";
import { Card, CardContent, Button } from "@/app/components/ui";
import type { Character } from "@/lib/characters/character-service";

interface RelationshipsEmptyStateProps {
  character: Character;
  onAddRelationship: () => void;
  isCreating?: boolean;
}

export const RelationshipsEmptyState: React.FC<
  RelationshipsEmptyStateProps
> = ({ character, onAddRelationship, isCreating = false }) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          No Relationships
        </h3>
        <p className="text-gray-400 mb-4">
          Create relationships to track {character.name}&#39;s connections with
          other characters.
        </p>
        <Button
          variant="outline"
          icon={Plus}
          onClick={onAddRelationship}
          disabled={isCreating}
        >
          {isCreating ? "Creating..." : "Create First Relationship"}
        </Button>
      </CardContent>
    </Card>
  );
};
