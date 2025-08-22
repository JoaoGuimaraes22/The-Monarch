// app/components/characters/character-detail-content/character-relationships/relationship-detail-view.tsx
// Detailed view of a specific relationship with timeline

import React, { useState } from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Users,
  Heart,
  UserCheck,
  Crown,
  Sword,
  Eye,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/app/components/ui";
import { useRelationshipStates } from "@/hooks/characters";
import type { RelationshipWithCharacters } from "@/lib/characters/relationship-service";

interface RelationshipDetailViewProps {
  relationship: RelationshipWithCharacters;
  novelId: string;
  characterId: string;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Relationship type icons (same as create dialog)
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

export const RelationshipDetailView: React.FC<RelationshipDetailViewProps> = ({
  relationship,
  novelId,
  characterId,
  onBack,
  onEdit,
  onDelete,
}) => {
  const [showAddStateDialog, setShowAddStateDialog] = useState(false);

  // Get relationship states
  const {
    states,
    isLoading: statesLoading,
    error: statesError,
    createState,
    updateState,
    deleteState,
    isCreating,
    isUpdating,
    isDeleting,
  } = useRelationshipStates(novelId, characterId, relationship.id);

  const RelationshipIcon = getRelationshipIcon(relationship.baseType);
  const iconColor = getRelationshipColor(relationship.baseType);

  // Handle add state
  const handleAddState = () => {
    setShowAddStateDialog(true);
    // TODO: Open create relationship state dialog
    console.log("Add relationship state");
  };

  // Handle edit state
  const handleEditState = (stateId: string) => {
    // TODO: Open edit relationship state dialog
    console.log("Edit relationship state:", stateId);
  };

  // Handle delete state
  const handleDeleteState = async (stateId: string) => {
    if (confirm("Are you sure you want to delete this relationship state?")) {
      await deleteState(stateId);
    }
  };

  // Get scope label for timeline
  const getScopeLabel = (state: any) => {
    switch (state.scopeType) {
      case "novel":
        return "Throughout Novel";
      case "act":
        return `Act ${state.startActId || "?"}`;
      case "chapter":
        return `Chapter ${state.startChapterId || "?"}`;
      case "scene":
        return `Scene ${state.startSceneId || "?"}`;
      default:
        return "Unknown Scope";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" icon={ArrowLeft} onClick={onBack}>
            Back to Relationships
          </Button>

          <div className="flex items-center space-x-3">
            <RelationshipIcon className={`w-6 h-6 ${iconColor}`} />
            <div>
              <h1 className="text-2xl font-bold text-white">
                {relationship.fromCharacter.name} &{" "}
                {relationship.toCharacter.name}
              </h1>
              <p className="text-gray-400">
                {relationship.baseType.replace("_", " ")} relationship
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" icon={Edit} onClick={onEdit}>
            Edit Relationship
          </Button>
          <Button
            variant="outline"
            icon={Trash2}
            onClick={onDelete}
            className="text-red-400 hover:text-red-300"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Character Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* From Character */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                {relationship.fromCharacter.imageUrl ? (
                  <img
                    src={relationship.fromCharacter.imageUrl}
                    alt={relationship.fromCharacter.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium text-lg">
                    {relationship.fromCharacter.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">
                  {relationship.fromCharacter.name}
                </h3>
                <p className="text-gray-400">
                  {relationship.fromCharacter.species}
                </p>
              </div>
            </div>

            {relationship.origin && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">
                  Their Perspective
                </h4>
                <p className="text-white">{relationship.origin}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* To Character */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                {relationship.toCharacter.imageUrl ? (
                  <img
                    src={relationship.toCharacter.imageUrl}
                    alt={relationship.toCharacter.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium text-lg">
                    {relationship.toCharacter.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">
                  {relationship.toCharacter.name}
                </h3>
                <p className="text-gray-400">
                  {relationship.toCharacter.species}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Reciprocal Perspective
              </h4>
              <p className="text-gray-500 italic">
                View from {relationship.toCharacter.name}&#39;s character page
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relationship Details */}
      {(relationship.history ||
        relationship.fundamentalDynamic ||
        relationship.writerNotes) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-white mb-4">
              Relationship Details
            </h3>

            <div className="space-y-4">
              {relationship.history && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    History
                  </h4>
                  <p className="text-white">{relationship.history}</p>
                </div>
              )}

              {relationship.fundamentalDynamic && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Fundamental Dynamic
                  </h4>
                  <p className="text-white">
                    {relationship.fundamentalDynamic}
                  </p>
                </div>
              )}

              {relationship.writerNotes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Writer Notes
                  </h4>
                  <p className="text-gray-300 italic">
                    {relationship.writerNotes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relationship States Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Relationship Evolution
            </h2>
            <p className="text-gray-400">
              Track how this relationship changes throughout the story
            </p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleAddState}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Add State"}
          </Button>
        </div>

        {statesLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-gray-700 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading relationship states...</p>
              </div>
            </CardContent>
          </Card>
        ) : statesError ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-red-400 mb-4">Error: {statesError}</p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : states.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No Relationship States
              </h3>
              <p className="text-gray-400 mb-4">
                Create relationship states to track how this relationship
                evolves throughout your story.
              </p>
              <Button
                variant="outline"
                icon={Plus}
                onClick={handleAddState}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create First State"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700"></div>

            <div className="space-y-8">
              {states.map((state, index) => (
                <div
                  key={state.id}
                  className="relative flex items-start space-x-4"
                >
                  {/* Timeline node */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900"></div>
                  </div>

                  {/* State card */}
                  <Card className="flex-1 max-w-2xl">
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {getScopeLabel(state)}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-white">
                            {state.currentType.replace("_", " ")}
                            {state.subtype && ` - ${state.subtype}`}
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => handleEditState(state.id)}
                            disabled={isUpdating}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleDeleteState(state.id)}
                            disabled={isDeleting}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Strength</div>
                          <div className="text-sm font-medium text-white">
                            {state.strength}/10
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Trust</div>
                          <div className="text-sm font-medium text-white">
                            {state.trustLevel}/10
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Conflict</div>
                          <div className="text-sm font-medium text-white">
                            {state.conflictLevel}/10
                          </div>
                        </div>
                      </div>

                      {/* Status and Changes */}
                      <div className="space-y-2">
                        {state.powerBalance !== "equal" && (
                          <div>
                            <span className="text-xs text-gray-400">
                              Power Balance:{" "}
                            </span>
                            <span className="text-sm text-white">
                              {state.powerBalance.replace("_", " ")}
                            </span>
                          </div>
                        )}

                        {state.publicStatus && (
                          <div>
                            <span className="text-xs text-gray-400">
                              Public Status:{" "}
                            </span>
                            <span className="text-sm text-white">
                              {state.publicStatus}
                            </span>
                          </div>
                        )}

                        {state.privateStatus && (
                          <div>
                            <span className="text-xs text-gray-400">
                              Private Status:{" "}
                            </span>
                            <span className="text-sm text-white">
                              {state.privateStatus}
                            </span>
                          </div>
                        )}

                        {state.changes && (
                          <div>
                            <span className="text-xs text-gray-400">
                              Changes:{" "}
                            </span>
                            <span className="text-sm text-gray-300">
                              {state.changes}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TODO: Add State Dialog */}
      {showAddStateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-white mb-4">
              Add Relationship State
            </h3>
            <p className="text-gray-400 mb-4">
              Create relationship state dialog will be implemented next.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAddStateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowAddStateDialog(false)}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
