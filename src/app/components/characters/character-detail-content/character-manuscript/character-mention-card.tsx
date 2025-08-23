// app/components/characters/character-detail-content/character-manuscript/character-mention-card.tsx
// Individual character mention display with navigation

import React from "react";
import { MapPin, Quote, Navigation, Star } from "lucide-react";
import { Card, CardContent, Badge, Button } from "@/app/components/ui";
import type { CharacterMention } from "@/lib/characters/character-text-analyzer";

interface CharacterMentionCardProps {
  mention: CharacterMention;
  sceneTitle: string;
  chapterTitle: string;
  actTitle: string;
  actOrder: number;
  chapterOrder: number;
  sceneOrder: number;
  onNavigateToMention?: (sceneId: string, position: number) => void;
  isNavigating?: boolean;
}

export const CharacterMentionCard: React.FC<CharacterMentionCardProps> = ({
  mention,
  sceneTitle,
  chapterTitle,
  actTitle,
  actOrder,
  chapterOrder,
  sceneOrder,
  onNavigateToMention,
  isNavigating = false,
}) => {
  const getMentionTypeColor = (type: string): string => {
    switch (type) {
      case "name":
        return "text-blue-400 border-blue-500/30";
      case "title":
        return "text-purple-400 border-purple-500/30";
      case "pronoun":
        return "text-green-400 border-green-500/30";
      case "description":
        return "text-orange-400 border-orange-500/30";
      default:
        return "text-gray-400 border-gray-500/30";
    }
  };

  const getMentionTypeIcon = (type: string) => {
    switch (type) {
      case "name":
        return <Star className="w-3 h-3" />;
      case "title":
        return <Star className="w-3 h-3" />;
      case "pronoun":
        return <Quote className="w-3 h-3" />;
      case "description":
        return <Quote className="w-3 h-3" />;
      default:
        return <Quote className="w-3 h-3" />;
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return "text-green-400";
    if (confidence >= 0.7) return "text-yellow-400";
    return "text-orange-400";
  };

  const handleNavigate = () => {
    if (onNavigateToMention) {
      onNavigateToMention(mention.sceneId, mention.startPosition);
    }
  };

  return (
    <Card className="hover:bg-gray-750 transition-colors">
      <CardContent className="p-4">
        {/* Header with location */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            <span>
              Act {actOrder}, Ch {chapterOrder}, Scene {sceneOrder}
            </span>
            {mention.lineNumber && (
              <span className="text-xs">• Line {mention.lineNumber}</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={`text-xs ${getMentionTypeColor(mention.mentionType)}`}
            >
              {getMentionTypeIcon(mention.mentionType)}
              <span className="ml-1 capitalize">{mention.mentionType}</span>
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs ${getConfidenceColor(mention.confidence)}`}
            >
              {Math.round(mention.confidence * 100)}%
            </Badge>
          </div>
        </div>

        {/* Scene context */}
        <div className="mb-3">
          <h4 className="text-sm font-medium text-white mb-1">{sceneTitle}</h4>
          <p className="text-xs text-gray-500">
            {chapterTitle} • {actTitle}
          </p>
        </div>

        {/* Mention context */}
        <div className="mb-4 p-3 bg-gray-700/30 rounded-lg">
          <div className="text-sm text-gray-300 leading-relaxed">
            <span className="text-gray-400">{mention.contextBefore}</span>
            <span className="bg-red-500/20 text-red-300 px-1 py-0.5 rounded font-medium">
              {mention.mentionText}
            </span>
            <span className="text-gray-400">{mention.contextAfter}</span>
          </div>
        </div>

        {/* Full context (if different/longer) */}
        {mention.fullContext !==
          `${mention.contextBefore}${mention.mentionText}${mention.contextAfter}` && (
          <details className="mb-4">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400 mb-2">
              Show full context
            </summary>
            <div className="p-2 bg-gray-800/50 rounded text-xs text-gray-400 leading-relaxed">
              {mention.fullContext}
            </div>
          </details>
        )}

        {/* Actions */}
        <div className="flex justify-end">
          {onNavigateToMention && (
            <Button
              onClick={handleNavigate}
              disabled={isNavigating}
              loading={isNavigating}
              size="sm"
              variant="outline"
              icon={Navigation}
            >
              {isNavigating ? "Navigating..." : "Go to Mention"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
