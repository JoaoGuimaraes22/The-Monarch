// app/components/characters/character-detail-content/character-relationships/relationships-grid.tsx
// Grid display for character relationships

import React from "react";
import { RelationshipCard } from "./relationship-card";
import type { RelationshipWithCurrentState } from "@/lib/characters/relationship-service";

interface RelationshipsGridProps {
  relationships: RelationshipWithCurrentState[];
  onViewDetails: (relationshipId: string) => void;
  onDeleteRelationship: (relationshipId: string) => void;
  isDeleting?: boolean;
}

export const RelationshipsGrid: React.FC<RelationshipsGridProps> = ({
  relationships,
  onViewDetails,
  onDeleteRelationship,
  isDeleting = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {relationships.map((relationship) => (
        <RelationshipCard
          key={relationship.id}
          relationship={relationship}
          onViewDetails={() => onViewDetails(relationship.id)}
          onDelete={() => onDeleteRelationship(relationship.id)}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};
