// app/components/characters/character-detail-content/edit-character-state-dialog.tsx
// Dialog for editing character states - following your established patterns

import React, { useState, useEffect } from "react";
import { X, Plus, Minus } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/app/components/ui";
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

  // Array field state
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

  // Array helpers
  const addArrayItem = (
    items: string[],
    setItems: (items: string[]) => void,
    newItem: string
  ) => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      setItems([...items, newItem.trim()]);
    }
  };

  const removeArrayItem = (
    items: string[],
    setItems: (items: string[]) => void,
    index: number
  ) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state) return;

    setIsSubmitting(true);

    try {
      const updates: UpdateCharacterStateOptions = {
        ...formData,
        age: formData.age ? Number(formData.age) : null,
        currentTraits,
        activeFears,
        currentGoals,
        motivations,
        skills,
        knowledge,
        secrets,
        changes: formData.changes ? { description: formData.changes } : null,
      };

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

  // Handle dialog close
  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !state) return null;

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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem(items, setItems, newItem);
                    setNewItem("");
                  }
                }}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => {
                  addArrayItem(items, setItems, newItem);
                  setNewItem("");
                }}
                className="p-2 text-green-400 hover:text-green-300 transition-colors"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Edit Character State</h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            disabled={isSubmitting || isUpdating}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Age
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="10000"
                      value={formData.age || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Character's age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Title
                    </label>
                    <Input
                      value={formData.title || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Lord, Captain, Doctor..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Occupation
                    </label>
                    <Input
                      value={formData.occupation || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, occupation: e.target.value })
                      }
                      placeholder="Knight, Merchant, Scholar..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Location
                    </label>
                    <Input
                      value={formData.location || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Current location"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Social Status
                    </label>
                    <Input
                      value={formData.socialStatus || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialStatus: e.target.value,
                        })
                      }
                      placeholder="Noble, Commoner, Outcast..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Faction
                    </label>
                    <Input
                      value={formData.faction || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, faction: e.target.value })
                      }
                      placeholder="House, Guild, Organization..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Mental State
                  </label>
                  <Input
                    value={formData.mentalState || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, mentalState: e.target.value })
                    }
                    placeholder="Describe mental/emotional state..."
                  />
                </div>
              </div>

              {/* Personality & Development */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Personality & Development
                </h3>

                <ArrayField
                  label="Current Traits"
                  items={currentTraits}
                  setItems={setCurrentTraits}
                  placeholder="Add personality trait..."
                />

                <ArrayField
                  label="Current Goals"
                  items={currentGoals}
                  setItems={setCurrentGoals}
                  placeholder="Add current goal..."
                />

                <ArrayField
                  label="Motivations"
                  items={motivations}
                  setItems={setMotivations}
                  placeholder="Add motivation..."
                />

                <ArrayField
                  label="Active Fears"
                  items={activeFears}
                  setItems={setActiveFears}
                  placeholder="Add fear or concern..."
                />
              </div>

              {/* Skills & Knowledge */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Skills & Knowledge
                </h3>

                <ArrayField
                  label="Skills"
                  items={skills}
                  setItems={setSkills}
                  placeholder="Add skill..."
                />

                <ArrayField
                  label="Knowledge"
                  items={knowledge}
                  setItems={setKnowledge}
                  placeholder="Add knowledge area..."
                />

                <ArrayField
                  label="Secrets"
                  items={secrets}
                  setItems={setSecrets}
                  placeholder="Add secret..."
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
                    value={formData.scopeType || "novel"}
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
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="novel">Throughout Novel</option>
                    <option value="act">Specific Act</option>
                    <option value="chapter">Specific Chapter</option>
                    <option value="scene">Specific Scene</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Changes & Notes
                  </label>
                  <Input
                    value={formData.changes || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, changes: e.target.value })
                    }
                    placeholder="What changed and why..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                <Button
                  variant="ghost"
                  onClick={handleClose}
                  disabled={isSubmitting || isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting || isUpdating}
                >
                  {isSubmitting || isUpdating ? "Updating..." : "Update State"}
                </Button>
              </div>
            </form>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};
