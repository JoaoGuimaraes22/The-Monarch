// app/components/characters/character-detail-content/character-manuscript/create-pov-assignment-dialog.tsx
// Dialog for creating POV assignments

import React, { useState } from "react";
import { Crown, X } from "lucide-react";
import { Button, Card, CardContent, Input, Select } from "@/app/components/ui";
import { useCreatePOVAssignment } from "@/hooks/characters";
import { CreatePOVAssignmentOptions } from "@/lib/characters/pov-service";
import type { Character } from "@/lib/characters/character-service";

interface CreatePOVAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  novelId: string;
  onSuccess?: () => void;
}

interface FormData {
  scopeType: "novel" | "act" | "chapter" | "scene";
  startActId: string;
  startChapterId: string;
  startSceneId: string;
  endActId: string;
  endChapterId: string;
  endSceneId: string;
  povType: "primary" | "secondary" | "shared";
  importance: number;
  notes: string;
  assignedBy: string;
  reason: string;
}

export const CreatePOVAssignmentDialog: React.FC<
  CreatePOVAssignmentDialogProps
> = ({ isOpen, onClose, character, novelId, onSuccess }) => {
  const { createAssignment, isCreating, error, clearError } =
    useCreatePOVAssignment(novelId);

  const [formData, setFormData] = useState<FormData>({
    scopeType: "novel",
    startActId: "",
    startChapterId: "",
    startSceneId: "",
    endActId: "",
    endChapterId: "",
    endSceneId: "",
    povType: "primary",
    importance: 100,
    notes: "",
    assignedBy: "",
    reason: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const options: CreatePOVAssignmentOptions = {
      novelId,
      characterId: character.id,
      scopeType: formData.scopeType,
      povType: formData.povType,
      importance: formData.importance,
      notes: formData.notes || undefined,
      assignedBy: formData.assignedBy || undefined,
      reason: formData.reason || undefined,
    };

    // Add scope-specific IDs
    if (formData.scopeType !== "novel") {
      if (formData.scopeType === "act" && formData.startActId) {
        options.startActId = formData.startActId;
        if (formData.endActId) options.endActId = formData.endActId;
      } else if (formData.scopeType === "chapter" && formData.startChapterId) {
        options.startChapterId = formData.startChapterId;
        if (formData.endChapterId) options.endChapterId = formData.endChapterId;
      } else if (formData.scopeType === "scene" && formData.startSceneId) {
        options.startSceneId = formData.startSceneId;
        if (formData.endSceneId) options.endSceneId = formData.endSceneId;
      }
    }

    const result = await createAssignment(options);

    if (result) {
      onSuccess?.();
      onClose();

      // Reset form
      setFormData({
        scopeType: "novel",
        startActId: "",
        startChapterId: "",
        startSceneId: "",
        endActId: "",
        endChapterId: "",
        endSceneId: "",
        povType: "primary",
        importance: 100,
        notes: "",
        assignedBy: "",
        reason: "",
      });
    }
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Crown className="w-5 h-5 text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Assign POV to {character.name}
              </h3>
              <p className="text-sm text-gray-400">
                Set when {character.name} narrates the story
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <Card className="border-red-700 bg-red-900/20">
              <CardContent className="p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Scope Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                POV Scope
              </label>
              <Select
                value={formData.scopeType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scopeType: e.target.value as FormData["scopeType"],
                  })
                }
                className="w-full"
              >
                <option value="novel">Entire Novel (Single POV)</option>
                <option value="act">Specific Acts</option>
                <option value="chapter">Specific Chapters</option>
                <option value="scene">Specific Scenes</option>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.scopeType === "novel" &&
                  "Character narrates the entire story"}
                {formData.scopeType === "act" &&
                  "Character narrates specific acts"}
                {formData.scopeType === "chapter" &&
                  "Character narrates specific chapters"}
                {formData.scopeType === "scene" &&
                  "Character narrates specific scenes"}
              </p>
            </div>

            {/* Scope-specific inputs */}
            {formData.scopeType !== "novel" && (
              <div className="p-4 bg-gray-800 rounded-lg space-y-4">
                <h4 className="text-sm font-medium text-gray-300">
                  {formData.scopeType === "act" && "Act Range"}
                  {formData.scopeType === "chapter" && "Chapter Range"}
                  {formData.scopeType === "scene" && "Scene Range"}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={`Start ${
                      formData.scopeType.charAt(0).toUpperCase() +
                      formData.scopeType.slice(1)
                    } ID`}
                    value={
                      formData.scopeType === "act"
                        ? formData.startActId
                        : formData.scopeType === "chapter"
                        ? formData.startChapterId
                        : formData.startSceneId
                    }
                    onChange={(e) => {
                      if (formData.scopeType === "act") {
                        setFormData({
                          ...formData,
                          startActId: e.target.value,
                        });
                      } else if (formData.scopeType === "chapter") {
                        setFormData({
                          ...formData,
                          startChapterId: e.target.value,
                        });
                      } else {
                        setFormData({
                          ...formData,
                          startSceneId: e.target.value,
                        });
                      }
                    }}
                    placeholder="Required"
                    required
                  />
                  <Input
                    label={`End ${
                      formData.scopeType.charAt(0).toUpperCase() +
                      formData.scopeType.slice(1)
                    } ID (Optional)`}
                    value={
                      formData.scopeType === "act"
                        ? formData.endActId
                        : formData.scopeType === "chapter"
                        ? formData.endChapterId
                        : formData.endSceneId
                    }
                    onChange={(e) => {
                      if (formData.scopeType === "act") {
                        setFormData({ ...formData, endActId: e.target.value });
                      } else if (formData.scopeType === "chapter") {
                        setFormData({
                          ...formData,
                          endChapterId: e.target.value,
                        });
                      } else {
                        setFormData({
                          ...formData,
                          endSceneId: e.target.value,
                        });
                      }
                    }}
                    placeholder="Leave empty for single item"
                  />
                </div>
              </div>
            )}
          </div>

          {/* POV Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                POV Type
              </label>
              <Select
                value={formData.povType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    povType: e.target.value as FormData["povType"],
                  })
                }
              >
                <option value="primary">Primary (Main narrator)</option>
                <option value="secondary">Secondary (Supporting POV)</option>
                <option value="shared">Shared (Multiple POVs)</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Importance (1-100)
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.importance}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    importance: parseInt(e.target.value) || 100,
                  })
                }
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <Input
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Why is this character POV for this scope?"
              maxLength={1000}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Assigned By (Optional)"
                value={formData.assignedBy}
                onChange={(e) =>
                  setFormData({ ...formData, assignedBy: e.target.value })
                }
                placeholder="Scene, event, or reason"
                maxLength={255}
              />

              <Input
                label="Reason (Optional)"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Story reason for POV change"
                maxLength={500}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreating}
              loading={isCreating} // ✅ FIXED: Use 'loading' instead of 'isLoading'
            >
              {isCreating ? "Creating..." : "Create POV Assignment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
