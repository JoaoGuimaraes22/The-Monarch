// app/components/characters/character-detail-content/create-character-state-dialog.tsx
// Dialog for creating new character states - following your established patterns

import React, { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { Button, Input, Card, CardContent } from "@/app/components/ui";
import type {
  Character,
  CreateCharacterStateOptions,
} from "@/lib/characters/character-service";

interface CreateCharacterStateDialogProps {
  character: Character;
  onClose: () => void;
  onCreate: (
    stateData: Omit<CreateCharacterStateOptions, "characterId">
  ) => Promise<boolean>;
}

export const CreateCharacterStateDialog: React.FC<
  CreateCharacterStateDialogProps
> = ({ character, onClose, onCreate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    changes?: string; // String in form, will convert to object for API
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
          : undefined, // Convert string to object
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
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
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
                disabled={!newItem.trim()}
                className="p-2 text-green-400 hover:text-green-300 disabled:text-gray-500 transition-colors"
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-white">
                Create Character State
              </h2>
              <p className="text-sm text-gray-400">
                Add a new state for {character.name}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Age
                </label>
                <Input
                  type="number"
                  value={formData.age?.toString() || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      age: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Character's age at this point"
                  min={0}
                  max={10000}
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
                  placeholder="Lord, Lady, Captain, Sir, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Occupation
                </label>
                <Input
                  value={formData.occupation || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, occupation: e.target.value })
                  }
                  placeholder="Knight, Merchant, Scholar, etc."
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
                  placeholder="Current location or residence"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Faction/Allegiance
                </label>
                <Input
                  value={formData.faction || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, faction: e.target.value })
                  }
                  placeholder="House, organization, or group"
                />
              </div>

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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="novel">Entire Novel</option>
                  <option value="act">Specific Act</option>
                  <option value="chapter">Specific Chapter</option>
                  <option value="scene">Specific Scene</option>
                </select>
              </div>
            </div>

            {/* Mental/Emotional State */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Mental/Emotional State
              </label>
              <Input
                value={formData.mentalState || ""}
                onChange={(e) =>
                  setFormData({ ...formData, mentalState: e.target.value })
                }
                placeholder="Confident, anxious, determined, broken, etc."
              />
            </div>

            {/* Character Arrays - Following your pattern of organized sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ArrayField
                label="Current Traits"
                items={currentTraits}
                setItems={setCurrentTraits}
                placeholder="Add a personality trait"
                maxItems={8}
              />

              <ArrayField
                label="Current Goals"
                items={currentGoals}
                setItems={setCurrentGoals}
                placeholder="Add a goal or objective"
                maxItems={6}
              />

              <ArrayField
                label="Skills & Abilities"
                items={skills}
                setItems={setSkills}
                placeholder="Add a skill or ability"
                maxItems={10}
              />

              <ArrayField
                label="Active Fears"
                items={activeFears}
                setItems={setActiveFears}
                placeholder="Add a fear or concern"
                maxItems={6}
              />

              <ArrayField
                label="Motivations"
                items={motivations}
                setItems={setMotivations}
                placeholder="Add a motivation"
                maxItems={6}
              />

              <ArrayField
                label="Knowledge"
                items={knowledge}
                setItems={setKnowledge}
                placeholder="Add knowledge or information"
                maxItems={8}
              />
            </div>

            {/* Secrets */}
            <ArrayField
              label="Secrets"
              items={secrets}
              setItems={setSecrets}
              placeholder="Add a secret the character knows or keeps"
              maxItems={5}
            />

            {/* Changes Description */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Changes & Notes
              </label>
              <textarea
                value={formData.changes || ""}
                onChange={(e) =>
                  setFormData({ ...formData, changes: e.target.value })
                }
                placeholder="Describe what changed since the last state and why..."
                className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                maxLength={2000}
              />
              {formData.changes && (
                <p className="text-xs text-gray-500 mt-1">
                  {formData.changes.length}/2000 characters
                </p>
              )}
            </div>
          </CardContent>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Creating..." : "Create State"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
