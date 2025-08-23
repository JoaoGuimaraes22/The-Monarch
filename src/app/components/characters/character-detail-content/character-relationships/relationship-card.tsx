// app/components/characters/character-detail-content/character-relationships/relationship-card.tsx
// Individual relationship card component - Updated with CharacterAvatar

import React from "react";
import { Heart, Users, UserCheck, Crown, Sword, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  CharacterAvatar,
} from "@/app/components/ui";
import type { RelationshipWithCurrentState } from "@/lib/characters/relationship-service";

interface RelationshipCardProps {
  relationship: RelationshipWithCurrentState;
  onViewDetails: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

// Relationship type icons
const getRelationshipIcon = (baseType: string) => {
  switch (baseType) {
    case "romantic":
      return Heart;
    case "family":
      return Users;
    case "friendship":
      return UserCheck;
    case "mentor_student":
      return Crown;
    case "antagonistic":
      return Sword;
    case "professional":
      return Eye;
    default:
      return Users;
  }
};

// Relationship type colors
const getRelationshipColor = (baseType: string) => {
  switch (baseType) {
    case "romantic":
      return "text-pink-400";
    case "family":
      return "text-blue-400";
    case "friendship":
      return "text-green-400";
    case "mentor_student":
      return "text-purple-400";
    case "antagonistic":
      return "text-red-400";
    case "professional":
      return "text-yellow-400";
    default:
      return "text-gray-400";
  }
};

// Get current state display info
const getCurrentStateInfo = (relationship: RelationshipWithCurrentState) => {
  const currentState = relationship.currentState;
  if (!currentState) {
    return {
      type: relationship.baseType,
      strength: 5,
      trustLevel: 5,
      conflictLevel: 1,
    };
  }

  return {
    type: currentState.currentType,
    strength: currentState.strength,
    trustLevel: currentState.trustLevel,
    conflictLevel: currentState.conflictLevel,
  };
};

export const RelationshipCard: React.FC<RelationshipCardProps> = ({
  relationship,
  onViewDetails,
  onDelete,
  isDeleting = false,
}) => {
  const RelationshipIcon = getRelationshipIcon(relationship.baseType);
  const iconColor = getRelationshipColor(relationship.baseType);
  const stateInfo = getCurrentStateInfo(relationship);

  return (
    <Card className="hover:bg-gray-750 transition-colors">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <CharacterAvatar
              name={relationship.toCharacter.name}
              imageUrl={relationship.toCharacter.imageUrl}
              size="sm"
            />
            <div>
              <h3 className="font-medium text-white">
                {relationship.toCharacter.name}
              </h3>
              <p className="text-sm text-gray-400">
                {relationship.toCharacter.species}
              </p>
            </div>
          </div>

          <RelationshipIcon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {/* Relationship info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Type</span>
            <Badge variant="outline" className="text-xs">
              {relationship.baseType.replace("_", " ")}
            </Badge>
          </div>

          {relationship.origin && (
            <div>
              <span className="text-sm text-gray-400">Origin</span>
              <p className="text-sm text-white line-clamp-2">
                {relationship.origin}
              </p>
            </div>
          )}

          {/* Current state metrics */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-700">
            <div className="text-center">
              <div className="text-xs text-gray-400">Strength</div>
              <div className="text-sm font-medium text-white">
                {stateInfo.strength}/10
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Trust</div>
              <div className="text-sm font-medium text-white">
                {stateInfo.trustLevel}/10
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400">Conflict</div>
              <div className="text-sm font-medium text-white">
                {stateInfo.conflictLevel}/10
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={onViewDetails}
          >
            View Details
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
