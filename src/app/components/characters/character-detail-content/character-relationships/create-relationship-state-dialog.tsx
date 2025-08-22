// app/components/characters/character-detail-content/character-relationships/create-relationship-state-dialog.tsx
// Dialog for creating new relationship states following your established patterns

import React, { useState } from "react";
import {
  X,
  Users,
  Heart,
  UserCheck,
  Shield,
  Sword,
  TrendingUp,
} from "lucide-react";
import { Button, Input, Card, CardContent, Select } from "@/app/components/ui";
import { useCreateRelationshipState } from "@/hooks/characters";
import type {
  RelationshipWithCharacters,
  CreateRelationshipStateOptions,
} from "@/lib/characters/relationship-service";

interface CreateRelationshipStateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  relationship: RelationshipWithCharacters;
  novelId: string;
  characterId: string;
  onStateCreated: () => void;
}

// Current type options with descriptions
const CURRENT_TYPE_OPTIONS = [
  {
    value: "ally",
    label: "Ally",
    description: "Working together towards common goals",
    icon: Shield,
  },
  {
    value: "enemy",
    label: "Enemy",
    description: "Actively opposed or in conflict",
    icon: Sword,
  },
  {
    value: "romantic",
    label: "Romantic",
    description: "Romantic involvement or attraction",
    icon: Heart,
  },
  {
    value: "neutral",
    label: "Neutral",
    description: "Neither supportive nor opposing",
    icon: Users,
  },
  {
    value: "complicated",
    label: "Complicated",
    description: "Complex, mixed feelings",
    icon: TrendingUp,
  },
  {
    value: "mentor",
    label: "Mentor",
    description: "Teaching or guiding relationship",
    icon: UserCheck,
  },
  {
    value: "rival",
    label: "Rival",
    description: "Competitive but not necessarily hostile",
    icon: Sword,
  },
  {
    value: "family",
    label: "Family",
    description: "Family-like bond or connection",
    icon: Users,
  },
];

// Power balance options
const POWER_BALANCE_OPTIONS = [
  {
    value: "equal",
    label: "Equal",
    description: "Both have similar influence",
  },
  {
    value: "a_dominant",
    label: `${relationship?.fromCharacter?.name} Dominant`,
    description: "They have more power/influence",
  },
  {
    value: "b_dominant",
    label: `${relationship?.toCharacter?.name} Dominant`,
    description: "The other has more power/influence",
  },
  {
    value: "shifting",
    label: "Shifting",
    description: "Power balance changes frequently",
  },
];

export const CreateRelationshipStateDialog: React.FC<
  CreateRelationshipStateDialogProps
> = ({
  isOpen,
  onClose,
  relationship,
  novelId,
  characterId,
  onStateCreated,
}) => {
  const [formData, setFormData] = useState<{
    currentType: string;
    subtype?: string;
    strength: number;
    publicStatus?: string;
    privateStatus?: string;
    trustLevel: number;
    conflictLevel: number;
    powerBalance: string;
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
    currentType: "",
    strength: 5,
    trustLevel: 5,
    conflictLevel: 1,
    powerBalance: "equal",
    scopeType: "novel",
  });

  const { createState, isCreating, error, clearError } =
    useCreateRelationshipState(novelId, characterId, relationship.id);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.currentType) {
      return;
    }

    // Prepare the data for API
    const stateData: Omit<CreateRelationshipStateOptions, "relationshipId"> = {
      currentType: formData.currentType,
      subtype: formData.subtype || undefined,
      strength: formData.strength,
      publicStatus: formData.publicStatus || undefined,
      privateStatus: formData.privateStatus || undefined,
      trustLevel: formData.trustLevel,
      conflictLevel: formData.conflictLevel,
      powerBalance: formData.powerBalance,
      scopeType: formData.scopeType,
      startActId: formData.startActId || null,
      startChapterId: formData.startChapterId || null,
      startSceneId: formData.startSceneId || null,
      endActId: formData.endActId || null,
      endChapterId: formData.endChapterId || null,
      endSceneId: formData.endSceneId || null,
      changes: formData.changes || undefined,
      triggerSceneId: formData.triggerSceneId || null,
    };

    const result = await createState(stateData);

    if (result) {
      // Reset form and close dialog
      setFormData({
        currentType: "",
        strength: 5,
        trustLevel: 5,
        conflictLevel: 1,
        powerBalance: "equal",
        scopeType: "novel",
      });
      onStateCreated();
      onClose();
    }
  };

  // Get selected current type data
  const selectedCurrentType = CURRENT_TYPE_OPTIONS.find(
    (option) => option.value === formData.currentType
  );

  // Clear error when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      clearError();
    }
  }, [isOpen, clearError]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              Add Relationship State
            </h2>
            <p className="text-gray-400 text-sm">
              Track how {relationship.fromCharacter.name} and{" "}
              {relationship.toCharacter.name} evolve
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={onClose}
            disabled={isCreating}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Relationship Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Relationship State
                </h3>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Current Type <span className="text-red-400">*</span>
                  </label>
                  <Select
                    value={formData.currentType}
                    onChange={(e) =>
                      setFormData({ ...formData, currentType: e.target.value })
                    }
                  >
                    <option value="">
                      Select current relationship type...
                    </option>
                    {CURRENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {selectedCurrentType && (
                    <p className="mt-1 text-xs text-gray-400">
                      {selectedCurrentType.description}
                    </p>
                  )}
                </div>

                <Input
                  label="Subtype (Optional)"
                  value={formData.subtype || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, subtype: e.target.value })
                  }
                  placeholder="e.g., bitter enemies, secret lovers, estranged siblings"
                />
              </div>

              {/* Relationship Dynamics */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Relationship Dynamics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Strength */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Strength: {formData.strength}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.strength}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          strength: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Intensity of the relationship
                    </div>
                  </div>

                  {/* Trust Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Trust: {formData.trustLevel}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.trustLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trustLevel: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Level of mutual trust
                    </div>
                  </div>

                  {/* Conflict Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Conflict: {formData.conflictLevel}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.conflictLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          conflictLevel: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      Level of tension/conflict
                    </div>
                  </div>
                </div>

                {/* Power Balance */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Power Balance
                  </label>
                  <Select
                    value={formData.powerBalance}
                    onChange={(e) =>
                      setFormData({ ...formData, powerBalance: e.target.value })
                    }
                  >
                    {POWER_BALANCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {POWER_BALANCE_OPTIONS.find(
                    (o) => o.value === formData.powerBalance
                  ) && (
                    <p className="mt-1 text-xs text-gray-400">
                      {
                        POWER_BALANCE_OPTIONS.find(
                          (o) => o.value === formData.powerBalance
                        )?.description
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Status (Public vs Private) */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Public vs Private Status
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Public Status"
                    value={formData.publicStatus || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, publicStatus: e.target.value })
                    }
                    placeholder="How they appear in public"
                  />
                  <Input
                    label="Private Status"
                    value={formData.privateStatus || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        privateStatus: e.target.value,
                      })
                    }
                    placeholder="True nature of relationship"
                  />
                </div>
              </div>

              {/* Story Context */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white border-b border-gray-700 pb-2">
                  Story Context
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Scope Type
                  </label>
                  <Select
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
                  >
                    <option value="novel">Throughout Novel</option>
                    <option value="act">Specific Act</option>
                    <option value="chapter">Specific Chapter</option>
                    <option value="scene">Specific Scene</option>
                  </Select>
                </div>

                {/* Scope-specific fields */}
                {formData.scopeType !== "novel" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.scopeType === "act" && (
                      <>
                        <Input
                          label="Start Act ID"
                          value={formData.startActId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startActId: e.target.value,
                            })
                          }
                          placeholder="Act where this state begins"
                        />
                        <Input
                          label="End Act ID (Optional)"
                          value={formData.endActId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endActId: e.target.value,
                            })
                          }
                          placeholder="Act where this state ends"
                        />
                      </>
                    )}
                    {formData.scopeType === "chapter" && (
                      <>
                        <Input
                          label="Start Chapter ID"
                          value={formData.startChapterId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startChapterId: e.target.value,
                            })
                          }
                          placeholder="Chapter where this state begins"
                        />
                        <Input
                          label="End Chapter ID (Optional)"
                          value={formData.endChapterId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endChapterId: e.target.value,
                            })
                          }
                          placeholder="Chapter where this state ends"
                        />
                      </>
                    )}
                    {formData.scopeType === "scene" && (
                      <>
                        <Input
                          label="Start Scene ID"
                          value={formData.startSceneId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startSceneId: e.target.value,
                            })
                          }
                          placeholder="Scene where this state begins"
                        />
                        <Input
                          label="End Scene ID (Optional)"
                          value={formData.endSceneId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endSceneId: e.target.value,
                            })
                          }
                          placeholder="Scene where this state ends"
                        />
                      </>
                    )}
                  </div>
                )}

                <Input
                  label="What Changed?"
                  value={formData.changes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, changes: e.target.value })
                  }
                  placeholder="Describe what triggered this relationship state..."
                />

                <Input
                  label="Trigger Scene ID (Optional)"
                  value={formData.triggerSceneId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, triggerSceneId: e.target.value })
                  }
                  placeholder="Scene that triggered this change"
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
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isCreating || !formData.currentType}
            className="min-w-[120px]"
          >
            {isCreating ? "Creating..." : "Create State"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
