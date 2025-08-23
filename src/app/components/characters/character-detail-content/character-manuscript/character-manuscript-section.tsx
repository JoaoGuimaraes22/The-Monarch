// app/components/characters/character-detail-content/character-manuscript/character-manuscript-section.tsx
// Enhanced character manuscript integration section with POV assignments

import React, { useState } from "react";
import { Crown, Plus, Eye, Search, BarChart3 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
} from "@/app/components/ui";
import { useCharacterPOV } from "@/hooks/characters";
import { POVAssignmentCard } from "./pov-assignment-card";
import { CreatePOVAssignmentDialog } from "./create-pov-assignment-dialog";
import type { Character } from "@/lib/characters/character-service";

interface CharacterManuscriptSectionProps {
  character: Character;
  novelId: string;
}

export const CharacterManuscriptSection: React.FC<
  CharacterManuscriptSectionProps
> = ({ character, novelId }) => {
  const {
    assignments,
    hasPOV,
    isLoading,
    error,
    getPrimaryPOVAssignments,
    getSecondaryPOVAssignments,
    getNovelWidePOV,
    getPOVImportanceTotal,
    refreshAssignments,
  } = useCharacterPOV(character.id, novelId);

  const [showCreatePOV, setShowCreatePOV] = useState(false);

  const primaryAssignments = getPrimaryPOVAssignments();
  const secondaryAssignments = getSecondaryPOVAssignments();
  const novelWidePOV = getNovelWidePOV();
  const totalImportance = getPOVImportanceTotal();

  const handleCreateSuccess = () => {
    refreshAssignments();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Manuscript Integration
          </h2>
          <p className="text-gray-400">Loading manuscript data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6 animate-pulse">
              <div className="h-16 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 animate-pulse">
              <div className="h-16 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Manuscript Integration
          </h2>
          <p className="text-gray-400">Error loading manuscript data</p>
        </div>
        <Card className="border-red-700">
          <CardContent className="p-6 text-center">
            <p className="text-red-400">{error}</p>
            <Button
              onClick={refreshAssignments}
              className="mt-4"
              variant="secondary"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Manuscript Integration
          </h2>
          <p className="text-gray-400">
            Track {character.name}&#39;s POV assignments and story appearances
          </p>
        </div>
      </div>

      {/* POV Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <span>POV Assignments</span>
            {hasPOV && (
              <Badge
                variant="default"
                className="bg-yellow-500/20 text-yellow-400"
              >
                {assignments.length}
              </Badge>
            )}
          </h3>
          <Button
            onClick={() => setShowCreatePOV(true)}
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            icon={Plus}
          >
            Assign POV
          </Button>
        </div>

        {/* POV Status Summary */}
        {hasPOV && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="border-yellow-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {primaryAssignments.length}
                </div>
                <p className="text-xs text-gray-400">Primary POV</p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {secondaryAssignments.length}
                </div>
                <p className="text-xs text-gray-400">Secondary POV</p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/30">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {totalImportance}
                </div>
                <p className="text-xs text-gray-400">Total Importance</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* POV Assignments List */}
        {assignments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {assignments.map((assignment) => (
              <POVAssignmentCard
                key={assignment.id}
                assignment={assignment}
                onEdit={() => {
                  // TODO: Implement edit dialog
                  console.log("Edit assignment", assignment.id);
                }}
                onDelete={() => {
                  // TODO: Implement delete functionality
                  console.log("Delete assignment", assignment.id);
                }}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No POV Assignments
              </h3>
              <p className="text-gray-400 mb-4">
                {character.name} is not currently assigned as POV character for
                any scope.
              </p>
              <Button
                onClick={() => setShowCreatePOV(true)}
                variant="secondary"
                icon={Plus}
              >
                Create First POV Assignment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Character Appearances Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="POV Scenes"
            icon={<Crown className="w-5 h-5 text-yellow-500" />}
          />
          <CardContent className="text-center py-8">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {hasPOV ? "TBD" : "0"}
            </div>
            <p className="text-gray-400">
              Scenes from {character.name}&#39;s perspective
            </p>
            {hasPOV && (
              <p className="text-xs text-gray-500 mt-2">
                Based on POV assignments above
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Character Mentions"
            icon={<Eye className="w-5 h-5 text-blue-500" />}
          />
          <CardContent className="text-center py-8">
            <div className="text-3xl font-bold text-white mb-2">0</div>
            <p className="text-gray-400">
              Times {character.name} appears in text
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Coming soon: Smart mention detection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Character Mentions Section (Future) */}
      <Card>
        <CardHeader
          title="Story Appearances"
          icon={<Search className="w-5 h-5 text-green-500" />}
        />
        <CardContent className="text-center py-12">
          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Character Mention Detection
          </h3>
          <p className="text-gray-400 mb-4">
            Smart text analysis will find where {character.name} appears in your
            manuscript, showing context snippets and enabling navigation to
            exact locations.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="text-gray-500">
              <BarChart3 className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Create POV Assignment Dialog */}
      <CreatePOVAssignmentDialog
        isOpen={showCreatePOV}
        onClose={() => setShowCreatePOV(false)}
        character={character}
        novelId={novelId}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};
