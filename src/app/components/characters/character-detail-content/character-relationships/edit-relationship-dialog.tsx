// app/components/characters/character-detail-content/character-relationships/edit-relationship-dialog.tsx
// Dialog for editing base relationship information following your established patterns

import React, { useState, useEffect } from "react";
import { X, Heart, Users, UserCheck, Crown, Sword, Eye } from "lucide-react";
import {
  Button,
  Input,
  Card,
  CardContent,
  Select,
  Badge,
} from "@/app/components/ui";
import type {
  RelationshipWithCharacters,
  UpdateRelationshipOptions,
} from "@/lib/characters/relationship-service";

interface EditRelationshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  relationship: RelationshipWithCharacters;
  onUpdate: (
    relationshipId: string,
    updates: UpdateRelationshipOptions
  ) => Promise<boolean>;
  isUpdating?: boolean;
}

// Relationship types with icons and descriptions
const RELATIONSHIP_TYPES = [
  {
    value: "romantic",
    label: "Romantic",
    description: "Love, attraction, or romantic involvement",
    icon: Heart,
    color: "text-pink-400",
  },
  {
    value: "family",
    label: "Family",
    description: "Blood relatives, adopted family, or family-like bonds",
    icon: Users,
    color: "text-blue-400",
  },
  {
    value: "friendship",
    label: "Friendship",
    description: "Personal friends and close companions",
    icon: UserCheck,
    color: "text-green-400",
  },
  {
    value: "mentor_student",
    label: "Mentor/Student",
    description: "Teaching, guidance, or learning relationships",
    icon: Crown,
    color: "text-purple-400",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Work colleagues, business partners, or professional contacts",
    icon: Eye,
    color: "text-yellow-400",
  },
  {
    value: "antagonistic",
    label: "Antagonistic",
    description: "Enemies, rivals, or opposing forces",
    icon: Sword,
    color: "text-red-400",
  },
];

export const EditRelationshipDialog: React.FC<EditRelationshipDialogProps> = ({
  isOpen,
  onClose,
  relationship,
  onUpdate,
  isUpdating = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state - initialize with current relationship values
  const [formData, setFormData] = useState<{
    baseType: string;
    origin: string;
    history: string;
    fundamentalDynamic: string;
    writerNotes: string;
  }>({
    baseType: "",
    origin: "",
    history: "",
    fundamentalDynamic: "",
    writerNotes: "",
  });

  // Initialize form data when relationship changes
  useEffect(() => {
    if (relationship && isOpen) {
      setFormData({
        baseType: relationship.baseType || "",
        origin: relationship.origin || "",
        history: relationship.history || "",
        fundamentalDynamic: relationship.fundamentalDynamic || "",
        writerNotes: relationship.writerNotes || "",
      });
    }
  }, [relationship, isOpen]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.baseType) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Build updates object - only include fields that have values or have changed
      const updates: UpdateRelationshipOptions = {};

      if (formData.baseType && formData.baseType.trim()) {
        updates.baseType = formData.baseType.trim();
      }

      if (formData.origin !== undefined) {
        updates.origin = formData.origin.trim() || undefined;
      }

      if (formData.history !== undefined) {
        updates.history = formData.history.trim() || undefined;
      }

      if (formData.fundamentalDynamic !== undefined) {
        updates.fundamentalDynamic =
          formData.fundamentalDynamic.trim() || undefined;
      }

      if (formData.writerNotes !== undefined) {
        updates.writerNotes = formData.writerNotes.trim() || undefined;
      }

      const success = await onUpdate(relationship.id, updates);

      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error("Error updating relationship:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close and reset
  const handleClose = () => {
    // Reset form to original values
    setFormData({
      baseType: relationship.baseType || "",
      origin: relationship.origin || "",
      history: relationship.history || "",
      fundamentalDynamic: relationship.fundamentalDynamic || "",
      writerNotes: relationship.writerNotes || "",
    });
    onClose();
  };

  // Get selected relationship type data
  const selectedRelationType = RELATIONSHIP_TYPES.find(
    (type) => type.value === formData.baseType
  );

  if (!isOpen || !relationship) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Relationship</h2>
            <p className="text-gray-400 text-sm">
              Update the core relationship between{" "}
              {relationship.fromCharacter.name} and{" "}
              {relationship.toCharacter.name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={handleClose}
            disabled={isSubmitting}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Character Info Display */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-300">
                    <span className="font-medium text-white">
                      {relationship.fromCharacter.name}
                    </span>
                    <span className="text-gray-400">
                      {" "}
                      ({relationship.fromCharacter.species})
                    </span>
                  </div>
                  <div className="text-gray-500">↔</div>
                  <div className="text-sm text-gray-300">
                    <span className="font-medium text-white">
                      {relationship.toCharacter.name}
                    </span>
                    <span className="text-gray-400">
                      {" "}
                      ({relationship.toCharacter.species})
                    </span>
                  </div>
                </div>
              </div>

              {/* Relationship Type */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Relationship Type <span className="text-red-400">*</span>
                </label>
                <Select
                  value={formData.baseType}
                  onChange={(e) =>
                    setFormData({ ...formData, baseType: e.target.value })
                  }
                >
                  <option value="">Select relationship type...</option>
                  {RELATIONSHIP_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                {selectedRelationType && (
                  <div className="mt-2 flex items-center space-x-2">
                    <selectedRelationType.icon
                      className={`w-4 h-4 ${selectedRelationType.color}`}
                    />
                    <Badge variant="outline" className="text-xs">
                      {selectedRelationType.label}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {selectedRelationType.description}
                    </span>
                  </div>
                )}
              </div>

              {/* Origin/Perspective */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  {relationship.fromCharacter.name}&#39;s Perspective
                </label>
                <Input
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                  placeholder={`How ${relationship.fromCharacter.name} sees this relationship...`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  How does {relationship.fromCharacter.name} describe or think
                  about {relationship.toCharacter.name}?
                </p>
              </div>

              {/* History */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Relationship History
                </label>
                <textarea
                  value={formData.history}
                  onChange={(e) =>
                    setFormData({ ...formData, history: e.target.value })
                  }
                  placeholder="Background of how this relationship formed and developed..."
                  className="w-full h-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-red-500 focus:outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  The backstory and key events that shaped this relationship.
                </p>
              </div>

              {/* Fundamental Dynamic */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Fundamental Dynamic
                </label>
                <Input
                  value={formData.fundamentalDynamic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fundamentalDynamic: e.target.value,
                    })
                  }
                  placeholder="Core pattern that defines this relationship..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  The underlying pattern or dynamic that remains consistent over
                  time.
                </p>
              </div>

              {/* Writer Notes */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Writer Notes
                </label>
                <textarea
                  value={formData.writerNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, writerNotes: e.target.value })
                  }
                  placeholder="Private notes about this relationship for your reference..."
                  className="w-full h-16 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-red-500 focus:outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Internal notes that won&#39;t appear in your story but help
                  you track this relationship.
                </p>
              </div>
            </form>
          </CardContent>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-700 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.baseType}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
