// app/components/characters/character-detail-content/character-manuscript/character-manuscript-section.tsx
// Fixed character manuscript integration section - eliminates excessive API calls

import React, { useState, useMemo } from "react";
import {
  Crown,
  Plus,
  Eye,
  Search,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
} from "@/app/components/ui";
import { useCharacterPOV, useCharacterMentions } from "@/hooks/characters";
import { POVAssignmentCard } from "./pov-assignment-card";
import { CreatePOVAssignmentDialog } from "./create-pov-assignment-dialog";
import { CharacterMentionsListDisplay } from "./character-mentions-list-display";
import { CharacterMentionAnalyticsChart } from "./character-mention-analytics-chart";
import type { Character } from "@/lib/characters/character-service";

interface CharacterManuscriptSectionProps {
  character: Character;
  novelId: string;
}

export const CharacterManuscriptSection: React.FC<
  CharacterManuscriptSectionProps
> = ({ character, novelId }) => {
  const [showCreatePOV, setShowCreatePOV] = useState(false);
  const [showMentions, setShowMentions] = useState(false);

  // POV data
  const {
    assignments,
    hasPOV,
    isLoading: povLoading,
    error: povError,
    getPrimaryPOVAssignments,
    getSecondaryPOVAssignments,
    getNovelWidePOV,
    getPOVImportanceTotal,
    refreshAssignments,
  } = useCharacterPOV(character.id, novelId);

  // ✅ FIX 3: Memoize options to prevent recreation on every render
  const mentionOptions = useMemo(
    () => ({
      contextLength: 50,
      fullContextLength: 200,
      minConfidence: 0.7,
      includePronounMatches: true,
    }),
    []
  );

  // ✅ FIX 4: Only use the hook ONCE at the top level
  const {
    mentions,
    analytics,
    isLoading: mentionsLoading,
    isAnalyzing,
    error: mentionsError,
    pagination,
    loadMentions,
    analyzeMentions,
    searchMentions,
    clearSearch,
    searchTerm,
    isSearching,
  } = useCharacterMentions(character.id, novelId, mentionOptions);

  const primaryAssignments = getPrimaryPOVAssignments();
  const secondaryAssignments = getSecondaryPOVAssignments();
  const novelWidePOV = getNovelWidePOV();
  const totalImportance = getPOVImportanceTotal();

  const handleCreatePOVSuccess = () => {
    refreshAssignments();
  };

  const handleNavigateToMention = (sceneId: string, position: number) => {
    // Navigate to manuscript editor with specific scene and position
    window.open(
      `/novels/${novelId}/manuscript?scene=${sceneId}&position=${position}`,
      "_blank"
    );
  };

  const isLoading = povLoading || mentionsLoading;
  const hasError = povError || mentionsError;

  if (isLoading && !assignments.length && !mentions.length) {
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

  if (hasError) {
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
            <p className="text-red-400">{povError || mentionsError}</p>
            <Button
              onClick={() => {
                refreshAssignments();
                // Refresh mentions by reloading
                loadMentions(1);
                analyzeMentions();
              }}
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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader
            title="POV Assignments"
            icon={<Crown className="w-5 h-5 text-yellow-500" />}
          />
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {assignments.length}
              </div>
              <p className="text-gray-400 text-sm">
                {totalImportance > 0 && `${totalImportance}% importance`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Mentions"
            icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
          />
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                {analytics?.totalMentions || 0}
              </div>
              <p className="text-gray-400 text-sm">
                {analytics?.totalScenes
                  ? `in ${analytics.totalScenes} scenes`
                  : "No mentions yet"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Screen Time"
            icon={<BarChart3 className="w-5 h-5 text-green-500" />}
          />
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {analytics?.povScenes || 0}
              </div>
              <p className="text-gray-400 text-sm">POV scenes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* POV Management Section */}
      <Card>
        <CardHeader
          title="POV Assignments"
          icon={<Crown className="w-5 h-5 text-yellow-500" />}
        />
        <CardContent>
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {hasPOV && (
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  {assignments.length} assignments
                </Badge>
              )}
            </div>
            <Button
              onClick={() => setShowCreatePOV(true)}
              size="sm"
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Assign POV
            </Button>
          </div>

          {/* POV Status Summary */}
          {hasPOV && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                    console.log("Edit assignment", assignment.id);
                  }}
                  onDelete={() => {
                    console.log("Delete assignment", assignment.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
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
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First POV Assignment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Character Mentions Section */}
      <Card>
        <CardHeader
          title="Character Mentions"
          icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
        />
        <CardContent>
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {analytics && (
                <Badge className="bg-blue-500/20 text-blue-400">
                  {analytics.totalMentions} found
                </Badge>
              )}
              {isAnalyzing && (
                <Badge variant="outline" className="text-gray-400">
                  Analyzing...
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={analyzeMentions}
                size="sm"
                variant="ghost"
                disabled={isAnalyzing}
                className="text-green-400 hover:text-green-300"
              >
                <BarChart3 className="w-4 h-4 mr-1" />
                {isAnalyzing ? "Analyzing..." : "Refresh Analytics"}
              </Button>
              <Button
                onClick={() => setShowMentions(!showMentions)}
                size="sm"
                variant="ghost"
                className="text-blue-400 hover:text-blue-300"
              >
                <Eye className="w-4 h-4 mr-1" />
                {showMentions ? "Hide" : "Show"} Mentions
              </Button>
            </div>
          </div>

          {!showMentions ? (
            <div className="text-center py-8">
              {analytics ? (
                <div>
                  <p className="text-gray-400 mb-4">
                    {analytics.totalMentions} mentions found across{" "}
                    {analytics.totalScenes} scenes
                  </p>
                  <Button
                    onClick={() => setShowMentions(true)}
                    variant="secondary"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    View All Mentions
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4">
                    Smart text analysis will find where {character.name} appears
                    in your manuscript
                  </p>
                  <Button
                    onClick={() => setShowMentions(true)}
                    variant="secondary"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Scan for Mentions
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mentions List - Takes up 2 columns */}
              <div className="lg:col-span-2">
                {/* ✅ FIX 5: Pass data as props instead of using hook again */}
                <CharacterMentionsListDisplay
                  character={character}
                  mentions={mentions}
                  isLoading={mentionsLoading}
                  isSearching={isSearching}
                  error={mentionsError}
                  pagination={pagination}
                  searchTerm={searchTerm}
                  onNavigateToMention={handleNavigateToMention}
                  onLoadMentions={loadMentions}
                  onSearchMentions={searchMentions}
                  onClearSearch={clearSearch}
                />
              </div>

              {/* Analytics Chart - Takes up 1 column */}
              <div>
                {analytics && (
                  <CharacterMentionAnalyticsChart
                    analytics={analytics}
                    isLoading={isAnalyzing}
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create POV Assignment Dialog */}
      <CreatePOVAssignmentDialog
        isOpen={showCreatePOV}
        onClose={() => setShowCreatePOV(false)}
        character={character}
        novelId={novelId}
        onSuccess={handleCreatePOVSuccess}
      />
    </div>
  );
};
