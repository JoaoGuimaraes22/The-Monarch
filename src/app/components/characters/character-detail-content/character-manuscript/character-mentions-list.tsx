// app/components/characters/character-detail-content/character-manuscript/character-mentions-list.tsx
// List of character mentions with search and pagination

import React, { useState } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Filter,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
} from "@/app/components/ui";
import { CharacterMentionCard } from "./character-mention-card";
import {
  useCharacterMentions,
  MentionAnalysisOptions,
} from "@/hooks/characters";
import type { Character } from "@/lib/characters/character-service";

interface CharacterMentionsListProps {
  character: Character;
  novelId: string;
  onNavigateToMention?: (sceneId: string, position: number) => void;
}

export const CharacterMentionsList: React.FC<CharacterMentionsListProps> = ({
  character,
  novelId,
  onNavigateToMention,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAnalysisOptions, setShowAnalysisOptions] = useState(false);
  const [analysisOptions, setAnalysisOptions] =
    useState<MentionAnalysisOptions>({
      contextLength: 50,
      fullContextLength: 200,
      minConfidence: 0.7,
      includePronounMatches: false,
      caseSensitive: false,
    });

  const {
    mentions,
    analytics,
    isLoading,
    isSearching,
    isAnalyzing,
    error,
    pagination,
    loadMentions,
    searchMentions,
    clearSearch,
    searchTerm: currentSearchTerm,
  } = useCharacterMentions(character.id, novelId, analysisOptions);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchMentions(searchTerm.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    clearSearch();
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    loadMentions(page);
  };

  // Handle analysis options change
  const handleAnalysisOptionsChange = (
    newOptions: Partial<MentionAnalysisOptions>
  ) => {
    setAnalysisOptions({ ...analysisOptions, ...newOptions });
  };

  if (error) {
    return (
      <Card className="border-red-700">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => loadMentions(1)} variant="secondary">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Analytics Summary */}
      {analytics && (
        <Card>
          <CardHeader
            title="Mention Analytics"
            icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
          />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {analytics.totalMentions}
                </div>
                <p className="text-xs text-gray-400">Total Mentions</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {analytics.totalScenes}
                </div>
                <p className="text-xs text-gray-400">Scenes with Appearances</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {analytics.povScenes}
                </div>
                <p className="text-xs text-gray-400">POV Scenes</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {
                    Object.keys(analytics.mentionDistribution.byMentionType)
                      .length
                  }
                </div>
                <p className="text-xs text-gray-400">Mention Types</p>
              </div>
            </div>

            {/* First/Last Appearance */}
            {(analytics.firstAppearance || analytics.lastAppearance) && (
              <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {analytics.firstAppearance && (
                  <div>
                    <span className="text-gray-400">First Appearance:</span>
                    <div className="text-white">
                      {analytics.firstAppearance.sceneTitle}
                      <span className="text-gray-500 ml-2">
                        (Act {analytics.firstAppearance.actOrder}, Ch{" "}
                        {analytics.firstAppearance.chapterOrder})
                      </span>
                    </div>
                  </div>
                )}
                {analytics.lastAppearance && (
                  <div>
                    <span className="text-gray-400">Last Appearance:</span>
                    <div className="text-white">
                      {analytics.lastAppearance.sceneTitle}
                      <span className="text-gray-500 ml-2">
                        (Act {analytics.lastAppearance.actOrder}, Ch{" "}
                        {analytics.lastAppearance.chapterOrder})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search mention context..."
                className="pl-10"
              />
            </div>
            <Button
              type="submit"
              disabled={isSearching || !searchTerm.trim()}
              loading={isSearching}
              variant="primary"
            >
              Search
            </Button>
            {currentSearchTerm && (
              <Button onClick={handleClearSearch} variant="outline" icon={X}>
                Clear
              </Button>
            )}
          </form>

          {/* Analysis Options Toggle */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setShowAnalysisOptions(!showAnalysisOptions)}
              variant="ghost"
              size="sm"
              icon={Filter}
            >
              Analysis Options
            </Button>

            {currentSearchTerm && (
              <p className="text-sm text-gray-400">
                Showing results for "{currentSearchTerm}"
              </p>
            )}
          </div>

          {/* Analysis Options Panel */}
          {showAnalysisOptions && (
            <div className="mt-4 p-4 bg-gray-700/30 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Context Length
                  </label>
                  <Input
                    type="number"
                    min="10"
                    max="200"
                    value={analysisOptions.contextLength}
                    onChange={(e) =>
                      handleAnalysisOptionsChange({
                        contextLength: parseInt(e.target.value) || 50,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Min Confidence (0.1-1.0)
                  </label>
                  <Input
                    type="number"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={analysisOptions.minConfidence}
                    onChange={(e) =>
                      handleAnalysisOptionsChange({
                        minConfidence: parseFloat(e.target.value) || 0.7,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={analysisOptions.includePronounMatches}
                    onChange={(e) =>
                      handleAnalysisOptionsChange({
                        includePronounMatches: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">
                    Include Pronouns
                  </span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={analysisOptions.caseSensitive}
                    onChange={(e) =>
                      handleAnalysisOptionsChange({
                        caseSensitive: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Case Sensitive</span>
                </label>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {(isLoading || isAnalyzing) && (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-pulse">
              <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-gray-400">
                {isAnalyzing ? "Analyzing mentions..." : "Loading mentions..."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mentions List */}
      {!isLoading && !isAnalyzing && mentions.length > 0 && (
        <>
          <div className="space-y-4">
            {mentions.map((appearance) =>
              appearance.mentions.map((mention, mentionIndex) => (
                <CharacterMentionCard
                  key={`${appearance.sceneId}-${mentionIndex}`}
                  mention={mention}
                  sceneTitle={appearance.sceneTitle}
                  chapterTitle={appearance.chapterTitle}
                  actTitle={appearance.actTitle}
                  actOrder={appearance.actOrder}
                  chapterOrder={appearance.chapterOrder}
                  sceneOrder={appearance.sceneOrder}
                  onNavigateToMention={onNavigateToMention}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && !currentSearchTerm && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Page {pagination.page} of {pagination.totalPages}(
                    {pagination.total} total mentions)
                  </p>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev || isLoading}
                      variant="outline"
                      size="sm"
                      icon={ChevronLeft}
                    >
                      Previous
                    </Button>

                    <Button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext || isLoading}
                      variant="outline"
                      size="sm"
                      icon={ChevronRight}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && !isAnalyzing && mentions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              {currentSearchTerm
                ? "No matching mentions found"
                : "No mentions detected"}
            </h3>
            <p className="text-gray-400 mb-4">
              {currentSearchTerm
                ? `No mentions found matching "${currentSearchTerm}"`
                : `${character.name} hasn't been mentioned in any scenes yet`}
            </p>
            {currentSearchTerm && (
              <Button onClick={handleClearSearch} variant="secondary">
                Show All Mentions
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
