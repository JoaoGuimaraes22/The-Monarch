// app/components/characters/character-detail-content/character-manuscript/character-mentions-list-display.tsx
// Display component for mentions list - receives data as props instead of using hooks

import React, { useState } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
} from "@/app/components/ui";
import { CharacterMentionCard } from "./character-mention-card";
import type { Character } from "@/lib/characters/character-service";
import type { CharacterAppearance } from "@/lib/characters/character-manuscript-service";

interface CharacterMentionsListDisplayProps {
  character: Character;
  mentions: CharacterAppearance[]; // Array of appearances, each containing mentions
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  searchTerm: string;
  onNavigateToMention?: (sceneId: string, position: number) => void;
  onLoadMentions: (page: number) => Promise<void>;
  onSearchMentions: (searchTerm: string) => Promise<void>;
  onClearSearch: () => void;
}

export const CharacterMentionsListDisplay: React.FC<
  CharacterMentionsListDisplayProps
> = ({
  character,
  mentions, // This is CharacterAppearance[]
  isLoading,
  isSearching,
  error,
  pagination,
  searchTerm: currentSearchTerm,
  onNavigateToMention,
  onLoadMentions,
  onSearchMentions,
  onClearSearch,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchTerm.trim()) {
      onSearchMentions(localSearchTerm.trim());
    }
  };

  const handleClearSearch = () => {
    setLocalSearchTerm("");
    onClearSearch();
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    onLoadMentions(page);
  };

  // Flatten appearances into individual mention cards
  const allMentionCards = mentions.flatMap((appearance) =>
    appearance.mentions.map((mention) => ({
      mention,
      appearance, // Keep reference to scene info
    }))
  );

  if (error) {
    return (
      <Card className="border-red-700">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => onLoadMentions(1)} variant="secondary">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader
          title="Search Mentions"
          icon={<Search className="w-5 h-5 text-blue-500" />}
        />
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <Input
              placeholder={`Search ${character.name}'s mentions...`}
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-600 text-white"
              disabled={isSearching}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isSearching || !localSearchTerm.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4" />
            </Button>
            {currentSearchTerm && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleClearSearch}
                className="text-gray-400"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </form>

          {currentSearchTerm && (
            <p className="text-sm text-gray-400 mt-2">
              Showing results for: &#34;{currentSearchTerm}&#34;
            </p>
          )}
        </CardContent>
      </Card>

      {/* Mentions List */}
      <div className="space-y-4">
        {isLoading && allMentionCards.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">
                {isSearching ? "Searching mentions..." : "Loading mentions..."}
              </p>
            </CardContent>
          </Card>
        ) : allMentionCards.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6 text-gray-400" />
              </div>
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
        ) : (
          <>
            {/* Mentions Cards */}
            {allMentionCards.map(({ mention, appearance }, index) => (
              <CharacterMentionCard
                key={`${mention.sceneId}-${mention.startPosition}-${index}`}
                mention={mention}
                sceneTitle={appearance.sceneTitle}
                chapterTitle={appearance.chapterTitle}
                actTitle={appearance.actTitle}
                actOrder={appearance.actOrder}
                chapterOrder={appearance.chapterOrder}
                sceneOrder={appearance.sceneOrder}
                onNavigateToMention={onNavigateToMention}
                isNavigating={false}
              />
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{" "}
                      of {pagination.total} mentions
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev || isLoading}
                        className="text-gray-400"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>

                      <span className="text-sm text-gray-400 px-3">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext || isLoading}
                        className="text-gray-400"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading more indicator */}
            {isLoading && allMentionCards.length > 0 && (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-gray-400">Loading more mentions...</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
