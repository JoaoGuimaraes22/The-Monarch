// app/components/characters/character-detail-content/character-manuscript/pov-assignment-card.tsx
// Individual POV assignment display card

import React from "react";
import { Crown, Edit3, Trash2, MoreHorizontal } from "lucide-react";
import { Card, CardContent, Badge } from "@/app/components/ui";
import { POVAssignmentWithCharacter } from "@/lib/characters/pov-service";

interface POVAssignmentCardProps {
  assignment: POVAssignmentWithCharacter;
  onEdit?: (assignment: POVAssignmentWithCharacter) => void;
  onDelete?: (assignmentId: string) => void;
  isDeleting?: boolean;
}

export const POVAssignmentCard: React.FC<POVAssignmentCardProps> = ({
  assignment,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const getScopeLabel = (assignment: POVAssignmentWithCharacter): string => {
    switch (assignment.scopeType) {
      case "novel":
        return "Entire Novel";
      case "act":
        return `Act ${
          assignment.startActId ? assignment.startActId.slice(-3) : "?"
        }`;
      case "chapter":
        return `Chapter ${
          assignment.startChapterId ? assignment.startChapterId.slice(-3) : "?"
        }`;
      case "scene":
        return `Scene ${
          assignment.startSceneId ? assignment.startSceneId.slice(-3) : "?"
        }`;
      default:
        return "Unknown Scope";
    }
  };

  const getPOVTypeColor = (povType: string): string => {
    switch (povType) {
      case "primary":
        return "text-yellow-400 border-yellow-500/30";
      case "secondary":
        return "text-blue-400 border-blue-500/30";
      case "shared":
        return "text-green-400 border-green-500/30";
      default:
        return "text-gray-400 border-gray-500/30";
    }
  };

  const getScopeColor = (scopeType: string): string => {
    switch (scopeType) {
      case "novel":
        return "text-purple-400";
      case "act":
        return "text-blue-400";
      case "chapter":
        return "text-green-400";
      case "scene":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <Card
      className={`border-l-4 ${getPOVTypeColor(assignment.povType)} relative`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Crown
              className={`w-4 h-4 ${getPOVTypeColor(assignment.povType)}`}
            />
            <Badge
              variant={
                assignment.povType === "primary" ? "default" : "secondary"
              }
              className="capitalize"
            >
              {assignment.povType}
            </Badge>
            {assignment.importance !== 100 && (
              <Badge variant="outline" className="text-xs">
                {assignment.importance}%
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(assignment)}
                className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                title="Edit Assignment"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(assignment.id)}
                disabled={isDeleting}
                className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors disabled:opacity-50"
                title="Delete Assignment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scope Information */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Scope:</span>
            <span
              className={`text-sm font-medium ${getScopeColor(
                assignment.scopeType
              )}`}
            >
              {getScopeLabel(assignment)}
            </span>
          </div>

          {/* Range Information */}
          {assignment.scopeType !== "novel" &&
            (assignment.endActId ||
              assignment.endChapterId ||
              assignment.endSceneId) && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">Range:</span>
                <span className="text-sm text-gray-300">
                  {assignment.scopeType === "act" &&
                    assignment.endActId &&
                    `Through Act ${assignment.endActId.slice(-3)}`}
                  {assignment.scopeType === "chapter" &&
                    assignment.endChapterId &&
                    `Through Chapter ${assignment.endChapterId.slice(-3)}`}
                  {assignment.scopeType === "scene" &&
                    assignment.endSceneId &&
                    `Through Scene ${assignment.endSceneId.slice(-3)}`}
                </span>
              </div>
            )}

          {/* Notes */}
          {assignment.notes && (
            <div className="mt-3 p-2 bg-gray-700/30 rounded text-sm text-gray-300">
              {assignment.notes}
            </div>
          )}

          {/* Assignment Details */}
          {(assignment.assignedBy || assignment.reason) && (
            <div className="mt-3 pt-2 border-t border-gray-700 space-y-1">
              {assignment.assignedBy && (
                <div className="text-xs text-gray-400">
                  Assigned by:{" "}
                  <span className="text-gray-300">{assignment.assignedBy}</span>
                </div>
              )}
              {assignment.reason && (
                <div className="text-xs text-gray-400">
                  Reason:{" "}
                  <span className="text-gray-300">{assignment.reason}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
