// app/components/characters/character-detail-content/character-state/character-states-timeline.tsx
// Fixed character states timeline with proper display and spacing

import React, { useState } from "react";
import {
  Plus,
  Clock,
  MapPin,
  Crown,
  Sword,
  Edit3,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  Button,
  Badge,
  DeleteConfirmationDialog,
} from "@/app/components/ui";
import { EditCharacterStateDialog } from "./edit-character-state-dialog";
import type {
  Character,
  CharacterState,
  UpdateCharacterStateOptions,
} from "@/lib/characters/character-service";

interface CharacterStatesTimelineProps {
  character: Character;
  states: CharacterState[];
  onAddState: () => void;
  onUpdateState: (
    stateId: string,
    updates: UpdateCharacterStateOptions
  ) => Promise<CharacterState | null>;
  onDeleteState: (stateId: string) => Promise<boolean>;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export const CharacterStatesTimeline: React.FC<
  CharacterStatesTimelineProps
> = ({
  character,
  states,
  onAddState,
  onUpdateState,
  onDeleteState,
  isUpdating = false,
  isDeleting = false,
}) => {
  const [editingState, setEditingState] = useState<CharacterState | null>(null);
  const [deletingStateId, setDeletingStateId] = useState<string | null>(null);

  // Handle edit state
  const handleEditState = (state: CharacterState) => {
    setEditingState(state);
  };

  // Handle delete state
  const handleDeleteState = (stateId: string) => {
    setDeletingStateId(stateId);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingStateId) return;

    const success = await onDeleteState(deletingStateId);
    if (success) {
      setDeletingStateId(null);
    }
  };

  // ✨ FIXED: Better array field parsing
  const parseArrayField = (field: string): string[] => {
    if (!field || field === "") return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // ✨ FIXED: Better changes field parsing
  const parseChangesField = (field: string | null): string => {
    if (!field) return "";

    // If it's already a string, return it
    if (typeof field === "string" && !field.startsWith("{")) {
      return field;
    }

    try {
      const parsed = JSON.parse(field);
      if (typeof parsed === "object" && parsed.description) {
        return parsed.description;
      }
      return String(parsed);
    } catch {
      return field;
    }
  };

  const getScopeLabel = (state: CharacterState): string => {
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

  // ✨ FIXED: Individual State Card Component
  const StateCard = ({ state }: { state: CharacterState }) => {
    const currentTraits = parseArrayField(state.currentTraits);
    const currentGoals = parseArrayField(state.currentGoals);
    const skills = parseArrayField(state.skills); // ✨ FIXED: Now properly parsed
    const activeFears = parseArrayField(state.activeFears);
    const motivations = parseArrayField(state.motivations);
    const knowledge = parseArrayField(state.knowledge);
    const secrets = parseArrayField(state.secrets);
    const changes = parseChangesField(state.changes); // ✨ FIXED: Now properly parsed

    return (
      <div className="relative flex items-start space-x-4">
        {/* Timeline node */}
        <div className="relative z-10 flex-shrink-0">
          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900"></div>
        </div>

        {/* ✨ FIXED: Smaller, more compact card */}
        <Card className="flex-1 max-w-2xl">
          {/* Compact header */}
          <div className="p-4 pb-2 border-b border-gray-700">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {getScopeLabel(state)}
                  </Badge>
                  {state.age && (
                    <Badge variant="default" className="text-xs">
                      Age {state.age}
                    </Badge>
                  )}
                </div>
                {(state.title || state.occupation) && (
                  <div className="flex items-center space-x-2">
                    {state.title && (
                      <span className="text-sm font-medium text-red-400">
                        {state.title}
                      </span>
                    )}
                    {state.occupation && (
                      <span className="text-sm text-gray-300">
                        {state.occupation}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEditState(state)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Edit state"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteState(state.id)}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete state"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ✨ FIXED: More compact content with better spacing */}
          <CardContent className="p-4">
            {/* Basic info - more compact grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* Location and Status */}
              <div className="space-y-2">
                {state.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {state.location}
                    </span>
                  </div>
                )}
                {state.socialStatus && (
                  <div className="flex items-center space-x-2">
                    <Crown className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {state.socialStatus}
                    </span>
                  </div>
                )}
                {state.faction && (
                  <div className="flex items-center space-x-2">
                    <Sword className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {state.faction}
                    </span>
                  </div>
                )}
              </div>

              {/* Mental State */}
              {state.mentalState && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-1">
                    Mental State
                  </h4>
                  <p className="text-sm text-gray-300">{state.mentalState}</p>
                </div>
              )}
            </div>

            {/* ✨ FIXED: Array fields with proper spacing and parsing */}
            <div className="space-y-3">
              {currentTraits.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2">
                    Current Traits
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {currentTraits.map((trait, index) => (
                      <Badge
                        key={index}
                        variant="default"
                        className="text-xs py-0.5 px-2"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {currentGoals.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2">
                    Current Goals
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {currentGoals.map((goal, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs py-0.5 px-2"
                      >
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* ✨ FIXED: Skills now showing properly */}
              {skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((skill, index) => (
                      <Badge
                        key={index}
                        className="text-xs py-0.5 px-2 bg-sky-700 text-white"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {activeFears.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2">
                    Active Fears
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {activeFears.map((fear, index) => (
                      <Badge
                        key={index}
                        className="text-xs py-0.5 px-2 bg-red-600 text-white"
                      >
                        {fear}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {motivations.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2">
                    Motivations
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {motivations.map((motivation, index) => (
                      <Badge
                        key={index}
                        className="text-xs py-0.5 px-2 bg-green-600 text-white"
                      >
                        {motivation}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {knowledge.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2">
                    Knowledge
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {knowledge.map((item, index) => (
                      <Badge
                        key={index}
                        className="text-xs py-0.5 px-2 bg-purple-600 text-white"
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {secrets.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2">
                    Secrets
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {secrets.map((secret, index) => (
                      <Badge
                        key={index}
                        className="text-xs py-0.5 px-2 bg-gray-700 text-white"
                      >
                        {secret}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* ✨ FIXED: Changes now properly formatted */}
              {changes && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 mb-2">
                    Changes
                  </h4>
                  <p className="text-sm text-gray-300 bg-gray-800 p-2 rounded text-xs leading-relaxed">
                    {changes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Character Evolution</h2>
          <p className="text-gray-400">
            Track how {character.name} changes throughout the story
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={onAddState}>
          Add State
        </Button>
      </div>

      {states.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Character States
            </h3>
            <p className="text-gray-400 mb-4">
              Create character states to track how {character.name} evolves
              throughout your story.
            </p>
            <Button variant="outline" icon={Plus} onClick={onAddState}>
              Create First State
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700"></div>

          <div className="space-y-8">
            {states.map((state) => (
              <StateCard key={state.id} state={state} />
            ))}
          </div>
        </div>
      )}

      {/* Edit State Dialog */}
      <EditCharacterStateDialog
        isOpen={!!editingState}
        onClose={() => setEditingState(null)}
        state={editingState}
        onUpdate={onUpdateState}
        isUpdating={isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!deletingStateId}
        onClose={() => setDeletingStateId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Character State"
        message="Are you sure you want to delete this character state? This action cannot be undone."
      />
    </div>
  );
};
