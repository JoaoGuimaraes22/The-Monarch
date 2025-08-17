import React, { useState } from "react";
import { Image } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Input,
  Textarea,
  Button,
} from "@/app/components/ui";
import { CreateNovelData } from "@/lib/novels";

interface CreateNovelFormProps {
  onSubmit: (data: CreateNovelData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const CreateNovelForm: React.FC<CreateNovelFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<CreateNovelData>({
    title: "",
    description: "",
    coverImage: "",
  });

  const handleInputChange = (field: keyof CreateNovelData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({ title: "", description: "", coverImage: "" });
    } catch (error) {
      // Error handling is done by parent component
      console.error("Failed to create novel:", error);
    }
  };

  const isFormValid = formData.title.trim() && formData.description.trim();

  return (
    <Card className="mb-8 bg-gray-800 border-gray-700 shadow-lg">
      <CardHeader
        title="Create New Novel"
        subtitle="Start your next epic story"
        className="border-gray-700"
      />
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Novel Title *
                </label>
                <Input
                  type="text"
                  placeholder="Enter your novel's title..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cover Image URL (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={formData.coverImage || ""}
                  onChange={(e) =>
                    handleInputChange("coverImage", e.target.value)
                  }
                  icon={Image}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <Textarea
                placeholder="Describe your novel's premise, themes, or basic plot..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={6}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              type="button"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? "Creating..." : "Create Novel"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
