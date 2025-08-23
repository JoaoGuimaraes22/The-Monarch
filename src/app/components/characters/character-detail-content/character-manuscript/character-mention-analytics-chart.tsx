// app/components/characters/character-detail-content/character-manuscript/character-mention-analytics-chart.tsx
// Visual analytics for character mention distribution

import React from "react";
import { BarChart3, TrendingUp, Users, Eye } from "lucide-react";
import { Card, CardHeader, CardContent, Badge } from "@/app/components/ui";
import type { CharacterManuscriptAnalytics } from "@/lib/characters/character-manuscript-service";

interface CharacterMentionAnalyticsChartProps {
  analytics: CharacterManuscriptAnalytics;
  isLoading?: boolean;
}

export const CharacterMentionAnalyticsChart: React.FC<
  CharacterMentionAnalyticsChartProps
> = ({ analytics, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader
          title="Mention Distribution"
          icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
        />
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMentionTypeIcon = (type: string) => {
    switch (type) {
      case "name":
        return <Users className="w-4 h-4" />;
      case "title":
        return <Users className="w-4 h-4" />;
      case "pronoun":
        return <Eye className="w-4 h-4" />;
      case "description":
        return <Eye className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getMentionTypeColor = (type: string): string => {
    switch (type) {
      case "name":
        return "text-blue-400 bg-blue-500/20";
      case "title":
        return "text-purple-400 bg-purple-500/20";
      case "pronoun":
        return "text-green-400 bg-green-500/20";
      case "description":
        return "text-orange-400 bg-orange-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  // Calculate percentages for visual bars
  const actEntries = Object.entries(analytics.mentionDistribution.byAct);
  const maxActMentions = Math.max(...actEntries.map(([, count]) => count), 1);

  const mentionTypeEntries = Object.entries(
    analytics.mentionDistribution.byMentionType
  );
  const maxTypeMentions = Math.max(
    ...mentionTypeEntries.map(([, count]) => count),
    1
  );

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <Card>
        <CardHeader
          title="Character Presence Overview"
          icon={<TrendingUp className="w-5 h-5 text-green-500" />}
        />
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {analytics.totalMentions}
              </div>
              <p className="text-sm text-gray-400">Total Mentions</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {analytics.totalScenes}
              </div>
              <p className="text-sm text-gray-400">Scenes</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {analytics.povScenes}
              </div>
              <p className="text-sm text-gray-400">POV Scenes</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {analytics.totalScenes > 0
                  ? Math.round(
                      (analytics.totalMentions / analytics.totalScenes) * 100
                    ) / 100
                  : 0}
              </div>
              <p className="text-sm text-gray-400">Avg/Scene</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution by Act */}
      {actEntries.length > 0 && (
        <Card>
          <CardHeader
            title="Distribution by Act"
            icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
          />
          <CardContent>
            <div className="space-y-4">
              {actEntries.map(([act, count]) => {
                const percentage = (count / maxActMentions) * 100;
                return (
                  <div key={act} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white">
                        {act}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {count} mentions
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Distribution by Mention Type */}
      {mentionTypeEntries.length > 0 && (
        <Card>
          <CardHeader
            title="Mention Types"
            icon={<Eye className="w-5 h-5 text-purple-500" />}
          />
          <CardContent>
            <div className="space-y-4">
              {mentionTypeEntries.map(([type, count]) => {
                const percentage = (count / analytics.totalMentions) * 100;
                const barWidth = (count / maxTypeMentions) * 100;

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-1 rounded ${getMentionTypeColor(type)}`}
                        >
                          {getMentionTypeIcon(type)}
                        </div>
                        <span className="text-sm font-medium text-white capitalize">
                          {type}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {count} ({Math.round(percentage)}%)
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          type === "name"
                            ? "bg-blue-500"
                            : type === "title"
                            ? "bg-purple-500"
                            : type === "pronoun"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chapter Breakdown (if there are multiple chapters) */}
      {Object.keys(analytics.mentionDistribution.byChapter).length > 1 && (
        <Card>
          <CardHeader
            title="Chapter Breakdown"
            icon={<BarChart3 className="w-5 h-5 text-green-500" />}
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
              {Object.entries(analytics.mentionDistribution.byChapter).map(
                ([chapter, count]) => (
                  <div
                    key={chapter}
                    className="flex justify-between items-center p-2 bg-gray-700/30 rounded"
                  >
                    <span className="text-sm text-gray-300 truncate">
                      {chapter}
                    </span>
                    <Badge variant="outline" className="text-xs ml-2">
                      {count}
                    </Badge>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
