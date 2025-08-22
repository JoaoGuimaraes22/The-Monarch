// app/components/characters/character-detail-content/character-states-timeline.tsx
// Enhanced character states timeline with edit and delete functionality

"use client";

import React, { useState, useRef, useEffect } from "react";
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

          <div className="space-y-6">
            {states.map((state, index) => (
              <StateCard
                key={state.id}
                state={state}
                isFirst={index === 0}
                isLast={index === states.length - 1}
                onEdit={handleEditState}
                onDelete={handleDeleteState}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
              />
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
        isDeleting={isDeleting}
      />
    </div>
  );
};

// Individual state card component with actions
interface StateCardProps {
  state: CharacterState;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (state: CharacterState) => void;
  onDelete: (stateId: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

const StateCard: React.FC<StateCardProps> = ({
  state,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const parseArrayField = (field: string): string[] => {
    if (!field || field === "") return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
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

  const currentTraits = parseArrayField(state.currentTraits);
  const currentGoals = parseArrayField(state.currentGoals);
  const skills = parseArrayField(state.skills);

  return (
    <div className="relative flex items-start space-x-4">
      {/* Timeline node */}
      <div className="relative z-10 flex-shrink-0">
        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900"></div>
      </div>

      {/* State content */}
      <Card className="flex-1">
        {/* Custom header with actions */}
        <div className="p-6 pb-3 border-b border-gray-700">
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

            {/* Actions dropdown - following your existing pattern */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                disabled={isUpdating || isDeleting}
              >
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>

              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-full mt-1 w-48 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10"
                >
                  <button
                    onClick={() => {
                      onEdit(state);
                      setShowMenu(false);
                    }}
                    disabled={isUpdating || isDeleting}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 hover:text-white flex items-center disabled:opacity-50"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit State
                  </button>
                  <button
                    onClick={() => {
                      onDelete(state.id);
                      setShowMenu(false);
                    }}
                    disabled={isUpdating || isDeleting}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete State
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location and Status */}
            <div className="space-y-2">
              {state.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {state.location}
                  </span>
                </div>
              )}
              {state.socialStatus && (
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {state.socialStatus}
                  </span>
                </div>
              )}
              {state.faction && (
                <div className="flex items-center space-x-2">
                  <Sword className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{state.faction}</span>
                </div>
              )}
            </div>

            {/* Mental State */}
            {state.mentalState && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Mental State</h4>
                <p className="text-sm text-gray-300">{state.mentalState}</p>
              </div>
            )}
          </div>

          {/* Traits, Goals, and Skills */}
          <div className="mt-4 space-y-3">
            {currentTraits.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">
                  Current Traits
                </h4>
                <div className="flex flex-wrap gap-1">
                  {currentTraits.map((trait, index) => (
                    <Badge key={index} variant="default" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {currentGoals.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">
                  Current Goals
                </h4>
                <div className="flex flex-wrap gap-1">
                  {currentGoals.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="default"
                      className="text-xs bg-gray-800"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Changes/Notes */}
          {state.changes && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-white mb-2">Changes</h4>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">
                {typeof state.changes === "string"
                  ? state.changes
                  : JSON.stringify(state.changes, null, 2)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
