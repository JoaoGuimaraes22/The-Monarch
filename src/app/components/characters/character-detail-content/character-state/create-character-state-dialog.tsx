// app/components/characters/character-detail-content/character-state/create-character-state-dialog.tsx
// Dialog for creating new character states with latest state template - following your established patterns

import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Clock, RefreshCw } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/app/components/ui";
import type {
  Character,
  CharacterState,
  CreateCharacterStateOptions,
} from "@/lib/characters/character-service";

interface CreateCharacterStateDialogProps {
  character: Character;
  states: CharacterState[]; // ✨ NEW: Add states array for template
  onClose: () => void;
  onCreate: (
    stateData: Omit<CreateCharacterStateOptions, "characterId">
  ) => Promise<boolean>;
}

export const CreateCharacterStateDialog: React.FC<
  CreateCharacterStateDialogProps
> = ({ character, states, onClose, onCreate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✨ NEW: Template state management
  const [useLatestAsTemplate, setUseLatestAsTemplate] = useState(true);
  const [latestState, setLatestState] = useState<CharacterState | null>(null);

  // Form data type - using string for changes in the form, will convert to object later
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

  // Array field state - following your pattern of separate state for arrays
  const [currentTraits, setCurrentTraits] = useState<string[]>([]);
  const [currentGoals, setCurrentGoals] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [activeFears, setActiveFears] = useState<string[]>([]);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [knowledge, setKnowledge] = useState<string[]>([]);
  const [secrets, setSecrets] = useState<string[]>([]);

  // ✨ NEW: Helper functions for latest state template
  const findLatestState = (states: CharacterState[]): CharacterState | null => {
    if (states.length === 0) return null;

    // Sort by creation date (most recent first)
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

  const populateFromLatestState = (latestState: CharacterState) => {
    return {
      // Basic info (copy most recent values)
      age: latestState.age || undefined,
      title: latestState.title || "",
      occupation: latestState.occupation || "",
      location: latestState.location || "",
      socialStatus: latestState.socialStatus || "",
      faction: latestState.faction || "",
      mentalState: latestState.mentalState || "",

      // Scope - default to novel level for new state
      scopeType: "novel" as const,
      startActId: undefined,
      startChapterId: undefined,
      startSceneId: undefined,
      endActId: undefined,
      endChapterId: undefined,
      endSceneId: undefined,

      // Changes - empty for new state
      changes: "",
      triggerSceneId: undefined,
    };
  };

  const populateArraysFromLatestState = (latestState: CharacterState) => {
    return {
      currentTraits: parseArrayField(latestState.currentTraits),
      currentGoals: parseArrayField(latestState.currentGoals),
      skills: parseArrayField(latestState.skills),
      activeFears: parseArrayField(latestState.activeFears),
      motivations: parseArrayField(latestState.motivations),
      knowledge: parseArrayField(latestState.knowledge),
      secrets: parseArrayField(latestState.secrets),
    };
  };

  // ✨ NEW: Initialize latest state and populate form
  useEffect(() => {
    const latest = findLatestState(states);
    setLatestState(latest);

    // If we have a latest state and want to use it as template, populate the form
    if (latest && useLatestAsTemplate) {
      const formData = populateFromLatestState(latest);
      setFormData(formData);

      const arrays = populateArraysFromLatestState(latest);
      setCurrentTraits(arrays.currentTraits);
      setCurrentGoals(arrays.currentGoals);
      setSkills(arrays.skills);
      setActiveFears(arrays.activeFears);
      setMotivations(arrays.motivations);
      setKnowledge(arrays.knowledge);
      setSecrets(arrays.secrets);
    }
  }, [states, useLatestAsTemplate]);

  // ✨ NEW: Handle template toggle
  const handleToggleTemplate = (useTemplate: boolean) => {
    setUseLatestAsTemplate(useTemplate);

    if (useTemplate && latestState) {
      // Populate from latest state
      const formData = populateFromLatestState(latestState);
      setFormData(formData);

      const arrays = populateArraysFromLatestState(latestState);
      setCurrentTraits(arrays.currentTraits);
      setCurrentGoals(arrays.currentGoals);
      setSkills(arrays.skills);
      setActiveFears(arrays.activeFears);
      setMotivations(arrays.motivations);
      setKnowledge(arrays.knowledge);
      setSecrets(arrays.secrets);
    } else {
      // Reset to empty form
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

  // Array helpers - simplified for your use case
  const addArrayItem = (
    array: string[],
    setter: (items: string[]) => void,
    newItem: string
  ) => {
    if (newItem.trim() && !array.includes(newItem.trim())) {
      setter([...array, newItem.trim()]);
    }
  };

  const removeArrayItem = (
    array: string[],
    setter: (items: string[]) => void,
    index: number
  ) => {
    setter(array.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const stateData: Omit<CreateCharacterStateOptions, "characterId"> = {
        ...formData,
        currentTraits,
        currentGoals,
        skills,
        activeFears,
        motivations,
        knowledge,
        secrets,
        age: formData.age ? Number(formData.age) : undefined,
        changes: formData.changes
          ? { description: formData.changes }
          : undefined,
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

  // ✨ NEW: Template toggle component
  const TemplateToggle = () => {
    if (!latestState) return null;

    return (
      <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <h3 className="text-sm font-medium text-white">
                Template Source
              </h3>
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

  // Reusable array field component
  const ArrayField = ({
    label,
    items,
    setItems,
    placeholder,
    maxItems = 10,
  }: {
    label: string;
    items: string[];
    setItems: (items: string[]) => void;
    placeholder: string;
    maxItems?: number;
  }) => {
    const [newItem, setNewItem] = useState("");

    return (
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">
          {label}{" "}
          {items.length > 0 && (
            <span className="text-gray-500">({items.length})</span>
          )}
        </label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 text-sm rounded border border-gray-600">
                {item}
              </span>
              <button
                type="button"
                onClick={() => removeArrayItem(items, setItems, index)}
                className="p-1 text-red-400 hover:text-red-300 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items.length < maxItems && (
            <div className="flex items-center space-x-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder={placeholder}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem(items, setItems, newItem);
                    setNewItem("");
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  addArrayItem(items, setItems, newItem);
                  setNewItem("");
                }}
                className="p-2 text-green-400 hover:text-green-300 transition-colors"
                disabled={!newItem.trim()}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Create Character State for {character.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - FIXED: Now scrollable like edit dialog */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ✨ NEW: Template Toggle */}
              <TemplateToggle />

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Age"
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: e.target.value ? Number(e.target.value) : undefined,
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

              {/* Mental State */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Mental State
                </label>
                <textarea
                  value={formData.mentalState || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, mentalState: e.target.value })
                  }
                  placeholder="Current emotional/psychological state"
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-red-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Array Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ArrayField
                  label="Current Traits"
                  items={currentTraits}
                  setItems={setCurrentTraits}
                  placeholder="Add a trait..."
                />
                <ArrayField
                  label="Current Goals"
                  items={currentGoals}
                  setItems={setCurrentGoals}
                  placeholder="Add a goal..."
                />
                <ArrayField
                  label="Skills"
                  items={skills}
                  setItems={setSkills}
                  placeholder="Add a skill..."
                />
                <ArrayField
                  label="Active Fears"
                  items={activeFears}
                  setItems={setActiveFears}
                  placeholder="Add a fear..."
                />
                <ArrayField
                  label="Motivations"
                  items={motivations}
                  setItems={setMotivations}
                  placeholder="Add a motivation..."
                />
                <ArrayField
                  label="Knowledge"
                  items={knowledge}
                  setItems={setKnowledge}
                  placeholder="Add knowledge..."
                />
              </div>

              <ArrayField
                label="Secrets"
                items={secrets}
                setItems={setSecrets}
                placeholder="Add a secret..."
                maxItems={5}
              />

              {/* Scope Selection */}
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

              {/* Changes Description */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  What Changed? (Optional)
                </label>
                <textarea
                  value={formData.changes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, changes: e.target.value })
                  }
                  placeholder="Describe what triggered this character state change..."
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-red-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-700 flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                >
                  Create Character State
                </Button>
              </div>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};
