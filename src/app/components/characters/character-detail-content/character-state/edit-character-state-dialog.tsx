// app/components/characters/character-detail-content/character-state/edit-character-state-dialog.tsx
// UPDATED: Dialog for editing character states with enhanced ArrayField and continuous focus
// Following your established patterns with improved UX

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardContent,
  ArrayField,
} from "@/app/components/ui";
import type {
  CharacterState,
  UpdateCharacterStateOptions,
} from "@/lib/characters/character-service";

interface EditCharacterStateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  state: CharacterState | null;
  onUpdate: (
    stateId: string,
    updates: UpdateCharacterStateOptions
  ) => Promise<CharacterState | null>;
  isUpdating?: boolean;
}

export const EditCharacterStateDialog: React.FC<
  EditCharacterStateDialogProps
> = ({ isOpen, onClose, state, onUpdate, isUpdating = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse JSON array fields safely
  const parseArrayField = (field: string): string[] => {
    if (!field || field === "") return [];
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // Parse changes field (can be string or object)
  const parseChangesField = (field: string | null): string => {
    if (!field) return "";
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

  // Form data state
  const [formData, setFormData] = useState<{
    age?: number;
    title?: string;
    occupation?: string;
    location?: string;
    socialStatus?: string;
    faction?: string;
    mentalState?: string;
    scopeType?: "novel" | "act" | "chapter" | "scene";
    startActId?: string;
    startChapterId?: string;
    startSceneId?: string;
    endActId?: string;
    endChapterId?: string;
    endSceneId?: string;
    changes?: string;
    triggerSceneId?: string;
  }>({});

  // Array field state - Using enhanced ArrayField component
  const [currentTraits, setCurrentTraits] = useState<string[]>([]);
  const [activeFears, setActiveFears] = useState<string[]>([]);
  const [currentGoals, setCurrentGoals] = useState<string[]>([]);
  const [motivations, setMotivations] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [knowledge, setKnowledge] = useState<string[]>([]);
  const [secrets, setSecrets] = useState<string[]>([]);

  // Initialize form data when state changes
  useEffect(() => {
    if (state) {
      setFormData({
        age: state.age || undefined,
        title: state.title || "",
        occupation: state.occupation || "",
        location: state.location || "",
        socialStatus: state.socialStatus || "",
        faction: state.faction || "",
        mentalState: state.mentalState || "",
        scopeType: state.scopeType as "novel" | "act" | "chapter" | "scene",
        startActId: state.startActId || "",
        startChapterId: state.startChapterId || "",
        startSceneId: state.startSceneId || "",
        endActId: state.endActId || "",
        endChapterId: state.endChapterId || "",
        endSceneId: state.endSceneId || "",
        changes: parseChangesField(state.changes),
        triggerSceneId: state.triggerSceneId || "",
      });

      // Initialize array fields
      setCurrentTraits(parseArrayField(state.currentTraits));
      setActiveFears(parseArrayField(state.activeFears));
      setCurrentGoals(parseArrayField(state.currentGoals));
      setMotivations(parseArrayField(state.motivations));
      setSkills(parseArrayField(state.skills));
      setKnowledge(parseArrayField(state.knowledge));
      setSecrets(parseArrayField(state.secrets));
    }
  }, [state]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state) return;

    setIsSubmitting(true);

    try {
      // Build updates object with proper data types
      const updates: UpdateCharacterStateOptions = {};

      // Only include fields that have values
      if (formData.age !== undefined && formData.age !== null) {
        updates.age = Number(formData.age);
      }

      if (formData.title && formData.title.trim()) {
        updates.title = formData.title.trim();
      }

      if (formData.occupation && formData.occupation.trim()) {
        updates.occupation = formData.occupation.trim();
      }

      if (formData.location && formData.location.trim()) {
        updates.location = formData.location.trim();
      }

      if (formData.socialStatus && formData.socialStatus.trim()) {
        updates.socialStatus = formData.socialStatus.trim();
      }

      if (formData.faction && formData.faction.trim()) {
        updates.faction = formData.faction.trim();
      }

      if (formData.mentalState && formData.mentalState.trim()) {
        updates.mentalState = formData.mentalState.trim();
      }

      // Array fields - only include if they have items
      if (currentTraits.length > 0) {
        updates.currentTraits = currentTraits;
      }

      if (activeFears.length > 0) {
        updates.activeFears = activeFears;
      }

      if (currentGoals.length > 0) {
        updates.currentGoals = currentGoals;
      }

      if (motivations.length > 0) {
        updates.motivations = motivations;
      }

      if (skills.length > 0) {
        updates.skills = skills;
      }

      if (knowledge.length > 0) {
        updates.knowledge = knowledge;
      }

      if (secrets.length > 0) {
        updates.secrets = secrets;
      }

      // Handle changes
      if (formData.changes && formData.changes.trim()) {
        updates.changes = formData.changes.trim();
      }

      const result = await onUpdate(state.id, updates);
      if (result) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating character state:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !state) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-gray-800 border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Edit Character State
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Update how your character has evolved
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
                    placeholder="Noble, Commoner, Outcast..."
                  />
                  <Input
                    label="Faction"
                    value={formData.faction || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, faction: e.target.value })
                    }
                    placeholder="House, Guild, Organization..."
                  />
                </div>

                <Input
                  label="Mental State"
                  value={formData.mentalState || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, mentalState: e.target.value })
                  }
                  placeholder="Describe mental/emotional state..."
                />
              </div>

              {/* Personality & Development - UPDATED with enhanced ArrayField */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Personality & Development
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* ✨ ENHANCED: Using new ArrayField with continuous focus */}
                  <ArrayField
                    label="Current Traits"
                    items={currentTraits}
                    setItems={setCurrentTraits}
                    placeholder="Add personality trait..."
                    maxItems={8}
                    continuousFocus={true} // Enable continuous focus feature
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
                  placeholder="Describe what changed about this character..."
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
