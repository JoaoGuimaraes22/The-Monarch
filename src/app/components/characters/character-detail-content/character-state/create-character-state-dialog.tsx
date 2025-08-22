// app/components/characters/character-detail-content/character-state/create-character-state-dialog.tsx
// UPDATED: Dialog for creating new character states with fixed layout and enhanced ArrayField
// Following your established patterns with improved UX

import React, { useState, useEffect } from "react";
import { X, Clock, RefreshCw } from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardContent,
  ArrayField,
} from "@/app/components/ui";
import type {
  Character,
  CharacterState,
  CreateCharacterStateOptions,
} from "@/lib/characters/character-service";

interface CreateCharacterStateDialogProps {
  character: Character;
  states: CharacterState[];
  onClose: () => void;
  onCreate: (
    stateData: Omit<CreateCharacterStateOptions, "characterId">
  ) => Promise<boolean>;
}

export const CreateCharacterStateDialog: React.FC<
  CreateCharacterStateDialogProps
> = ({ character, states, onClose, onCreate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Template state management
  const [useLatestAsTemplate, setUseLatestAsTemplate] = useState(true);
  const [latestState, setLatestState] = useState<CharacterState | null>(null);

  // Form data state
  const [formData, setFormData] = useState<{
    age?: number;
    title?: string;
    occupation?: string;
    location?: string;
    socialStatus?: string;
    faction?: string;
    mentalState?: string;
    scopeType: "novel" | "act" | "chapter" | "scene";
    startActId?: string;
    startChapterId?: string;
    startSceneId?: string;
    endActId?: string;
    endChapterId?: string;
    endSceneId?: string;
    changes?: string;
    triggerSceneId?: string;
  }>({
    scopeType: "novel",
  });

  // Array field state - using enhanced ArrayField component
  const [currentTraits, setCurrentTraits] = useState<string[]>([]);
  const [currentGoals, setCurrentGoals] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [activeFears, setActiveFears] = useState<string[]>([]);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [knowledge, setKnowledge] = useState<string[]>([]);
  const [secrets, setSecrets] = useState<string[]>([]);

  // Helper functions for latest state template
  const findLatestState = (states: CharacterState[]): CharacterState | null => {
    if (states.length === 0) return null;

    const sortedStates = [...states].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sortedStates[0];
  };

  const parseArrayField = (field: string): string[] => {
    if (!field || field === "") return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Initialize latest state on mount
  useEffect(() => {
    const latest = findLatestState(states);
    setLatestState(latest);

    if (useLatestAsTemplate && latest) {
      loadTemplateFromState(latest);
    }
  }, [states, useLatestAsTemplate]);

  const loadTemplateFromState = (state: CharacterState) => {
    setFormData({
      age: state.age || undefined,
      title: state.title || "",
      occupation: state.occupation || "",
      location: state.location || "",
      socialStatus: state.socialStatus || "",
      faction: state.faction || "",
      mentalState: state.mentalState || "",
      scopeType:
        (state.scopeType as "novel" | "act" | "chapter" | "scene") || "novel",
      startActId: state.startActId || "",
      startChapterId: state.startChapterId || "",
      startSceneId: state.startSceneId || "",
      endActId: state.endActId || "",
      endChapterId: state.endChapterId || "",
      endSceneId: state.endSceneId || "",
      changes: "",
      triggerSceneId: state.triggerSceneId || "",
    });

    // Load array fields
    setCurrentTraits(parseArrayField(state.currentTraits));
    setCurrentGoals(parseArrayField(state.currentGoals));
    setSkills(parseArrayField(state.skills));
    setActiveFears(parseArrayField(state.activeFears));
    setMotivations(parseArrayField(state.motivations));
    setKnowledge(parseArrayField(state.knowledge));
    setSecrets(parseArrayField(state.secrets));
  };

  const handleToggleTemplate = (useTemplate: boolean) => {
    setUseLatestAsTemplate(useTemplate);

    if (useTemplate && latestState) {
      loadTemplateFromState(latestState);
    } else {
      // Reset to blank form
      setFormData({ scopeType: "novel" });
      setCurrentTraits([]);
      setCurrentGoals([]);
      setSkills([]);
      setActiveFears([]);
      setMotivations([]);
      setKnowledge([]);
      setSecrets([]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const stateData: Omit<CreateCharacterStateOptions, "characterId"> = {
        age: formData.age,
        title: formData.title || undefined,
        occupation: formData.occupation || undefined,
        location: formData.location || undefined,
        socialStatus: formData.socialStatus || undefined,
        faction: formData.faction || undefined,
        mentalState: formData.mentalState || undefined,
        currentTraits: currentTraits.length > 0 ? currentTraits : undefined,
        activeFears: activeFears.length > 0 ? activeFears : undefined,
        currentGoals: currentGoals.length > 0 ? currentGoals : undefined,
        motivations: motivations.length > 0 ? motivations : undefined,
        skills: skills.length > 0 ? skills : undefined,
        knowledge: knowledge.length > 0 ? knowledge : undefined,
        secrets: secrets.length > 0 ? secrets : undefined,
        scopeType: formData.scopeType,
        startActId: formData.startActId || undefined,
        startChapterId: formData.startChapterId || undefined,
        startSceneId: formData.startSceneId || undefined,
        endActId: formData.endActId || undefined,
        endChapterId: formData.endChapterId || undefined,
        endSceneId: formData.endSceneId || undefined,
        changes:
          formData.changes && formData.changes.trim()
            ? { description: formData.changes.trim() }
            : undefined,
        triggerSceneId: formData.triggerSceneId || undefined,
      };

      const success = await onCreate(stateData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Error creating character state:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Template toggle component
  const TemplateToggle = () => {
    if (!latestState) return null;

    return (
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-red-400" />
            <div>
              <h4 className="text-sm font-medium text-white">
                Template Source
              </h4>
              <p className="text-xs text-gray-400">
                {useLatestAsTemplate
                  ? `Based on latest state (${new Date(
                      latestState.createdAt
                    ).toLocaleDateString()})`
                  : "Starting with blank form"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleToggleTemplate(false)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                !useLatestAsTemplate
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Start Fresh
            </button>
            <button
              type="button"
              onClick={() => handleToggleTemplate(true)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                useLatestAsTemplate
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Use Latest
            </button>
          </div>
        </div>

        {useLatestAsTemplate && (
          <div className="mt-3 p-2 bg-gray-900 rounded text-xs text-gray-400">
            <strong className="text-red-400">Tip:</strong> Form is pre-filled
            with {character.name}&#39;s latest state. Modify the fields below to
            show how they&#39;ve evolved.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-gray-800 border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Create Character State for {character.name}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Capture how your character has evolved
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Template Toggle */}
              <TemplateToggle />

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Current Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input
                    label="Age"
                    type="number"
                    value={formData.age || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        age: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Character's current age"
                  />
                  <Input
                    label="Title"
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Lord, Captain, Dr., etc."
                  />
                  <Input
                    label="Occupation"
                    value={formData.occupation || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, occupation: e.target.value })
                    }
                    placeholder="Current job or role"
                  />
                  <Input
                    label="Location"
                    value={formData.location || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Where they are currently"
                  />
                  <Input
                    label="Social Status"
                    value={formData.socialStatus || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, socialStatus: e.target.value })
                    }
                    placeholder="Noble, commoner, outcast, etc."
                  />
                  <Input
                    label="Faction"
                    value={formData.faction || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, faction: e.target.value })
                    }
                    placeholder="Group or organization they belong to"
                  />
                </div>

                <Input
                  label="Mental State"
                  value={formData.mentalState || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, mentalState: e.target.value })
                  }
                  placeholder="Current emotional/psychological state"
                />
              </div>

              {/* Personality & Development - UPDATED with enhanced ArrayField */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Personality & Development
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ArrayField
                    label="Current Traits"
                    items={currentTraits}
                    setItems={setCurrentTraits}
                    placeholder="Add personality trait..."
                    maxItems={8}
                    continuousFocus={true}
                  />

                  <ArrayField
                    label="Current Goals"
                    items={currentGoals}
                    setItems={setCurrentGoals}
                    placeholder="Add current goal..."
                    maxItems={6}
                    continuousFocus={true}
                  />

                  <ArrayField
                    label="Motivations"
                    items={motivations}
                    setItems={setMotivations}
                    placeholder="Add motivation..."
                    maxItems={6}
                    continuousFocus={true}
                  />

                  <ArrayField
                    label="Active Fears"
                    items={activeFears}
                    setItems={setActiveFears}
                    placeholder="Add fear or concern..."
                    maxItems={5}
                    continuousFocus={true}
                  />
                </div>
              </div>

              {/* Skills & Knowledge - UPDATED with enhanced ArrayField */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Skills & Knowledge
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ArrayField
                    label="Skills"
                    items={skills}
                    setItems={setSkills}
                    placeholder="Add skill..."
                    maxItems={10}
                    continuousFocus={true}
                  />

                  <ArrayField
                    label="Knowledge"
                    items={knowledge}
                    setItems={setKnowledge}
                    placeholder="Add knowledge area..."
                    maxItems={8}
                    continuousFocus={true}
                  />
                </div>

                <ArrayField
                  label="Secrets"
                  items={secrets}
                  setItems={setSecrets}
                  placeholder="Add secret..."
                  maxItems={5}
                  continuousFocus={true}
                />
              </div>

              {/* Story Context */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Story Context
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Scope Type
                  </label>
                  <select
                    value={formData.scopeType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scopeType: e.target.value as
                          | "novel"
                          | "act"
                          | "chapter"
                          | "scene",
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-red-500"
                  >
                    <option value="novel">Throughout Novel</option>
                    <option value="act">Specific Act</option>
                    <option value="chapter">Specific Chapter</option>
                    <option value="scene">Specific Scene</option>
                  </select>
                </div>

                <Input
                  label="What Changed?"
                  value={formData.changes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, changes: e.target.value })
                  }
                  placeholder="Describe what triggered this character state change..."
                />
              </div>
            </form>
          </CardContent>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Creating..." : "Create State"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
