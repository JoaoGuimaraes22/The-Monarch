// app/components/characters/character-detail-content/character-states-timeline.tsx
// Character states timeline section

import React from "react";
import { Plus, Clock, MapPin, Crown, Sword } from "lucide-react";
import { Card, CardHeader, CardContent, Button } from "@/app/components/ui";
import type {
  Character,
  CharacterState,
} from "@/lib/characters/character-service";

interface CharacterStatesTimelineProps {
  character: Character;
  states: CharacterState[];
  onAddState: () => void;
}

export const CharacterStatesTimeline: React.FC<
  CharacterStatesTimelineProps
> = ({ character, states, onAddState }) => {
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Individual state card component
interface StateCardProps {
  state: CharacterState;
  isFirst: boolean;
  isLast: boolean;
}

const StateCard: React.FC<StateCardProps> = ({ state }) => {
  const parseArrayField = (field: string): string[] => {
    if (!field || field === "") return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const currentTraits = parseArrayField(state.currentTraits);
  const currentGoals = parseArrayField(state.currentGoals);
  const skills = parseArrayField(state.skills);

  return (
    <div className="relative flex">
      {/* Timeline dot */}
      <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gray-800 border-4 border-red-600 rounded-full">
        <Crown className="w-6 h-6 text-red-400" />
      </div>

      {/* State content */}
      <div className="flex-1 ml-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {state.title || `Age ${state.age || "Unknown"}`}
                </h3>
                <p className="text-sm text-gray-400">
                  {state.scopeType} •{" "}
                  {state.startActId ? `Act ${state.startActId}` : "Story-wide"}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {state.age && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Age
                  </label>
                  <p className="text-sm text-white">{state.age}</p>
                </div>
              )}
              {state.title && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Title
                  </label>
                  <p className="text-sm text-white">{state.title}</p>
                </div>
              )}
              {state.occupation && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Occupation
                  </label>
                  <p className="text-sm text-white">{state.occupation}</p>
                </div>
              )}
              {state.faction && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Faction
                  </label>
                  <p className="text-sm text-white">{state.faction}</p>
                </div>
              )}
            </div>

            {/* Location */}
            {state.location && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Location
                </label>
                <p className="text-sm text-white">{state.location}</p>
              </div>
            )}

            {/* Traits */}
            {currentTraits.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Current Traits
                </label>
                <div className="flex flex-wrap gap-1">
                  {currentTraits.map((trait, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Goals */}
            {currentGoals.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Current Goals
                </label>
                <div className="flex flex-wrap gap-1">
                  {currentGoals.map((goal, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <label className="block text-xs text-gray-500 mb-2">
                  Skills
                </label>
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded"
                    >
                      <Sword className="w-3 h-3 inline mr-1" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mental state */}
            {state.mentalState && (
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Mental State
                </label>
                <p className="text-sm text-gray-300">{state.mentalState}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
