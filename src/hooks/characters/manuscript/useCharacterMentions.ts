// hooks/characters/manuscript/useCharacterMentions.ts
// Fixed hook for character mention detection - eliminates excessive API calls

import { useState, useCallback, useEffect, useMemo } from "react";
import type {
  CharacterAppearance,
  CharacterManuscriptAnalytics,
} from "@/lib/characters/character-manuscript-service";

// ===== HOOK RETURN TYPE =====
export interface UseCharacterMentionsReturn {
  // State
  mentions: CharacterAppearance[];
  analytics: CharacterManuscriptAnalytics | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;

  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;

  // Actions
  loadMentions: (page?: number) => Promise<void>;
  analyzeMentions: () => Promise<void>;
  searchMentions: (searchTerm: string) => Promise<void>;
  clearSearch: () => void;

  // State
  searchTerm: string;
  isSearching: boolean;
}

// ===== MENTION ANALYSIS OPTIONS =====
export interface MentionAnalysisOptions {
  contextLength?: number;
  fullContextLength?: number;
  minConfidence?: number;
  includePronounMatches?: boolean;
  caseSensitive?: boolean;
}

// ===== CHARACTER MENTIONS HOOK =====
export function useCharacterMentions(
  characterId: string,
  novelId: string,
  options: MentionAnalysisOptions = {}
): UseCharacterMentionsReturn {
  const [mentions, setMentions] = useState<CharacterAppearance[]>([]);
  const [analytics, setAnalytics] =
    useState<CharacterManuscriptAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [pagination, setPagination] =
    useState<UseCharacterMentionsReturn["pagination"]>(null);

  // ✅ FIX 1: Memoize options to prevent recreation
  const stableOptions = useMemo(
    () => options,
    [
      options.contextLength,
      options.fullContextLength,
      options.minConfidence,
      options.includePronounMatches,
      options.caseSensitive,
    ]
  );

  // ===== BUILD QUERY PARAMS =====
  const buildQueryParams = useCallback(
    (additionalParams: Record<string, unknown> = {}) => {
      const params = new URLSearchParams();

      // Add analysis options
      if (stableOptions.contextLength)
        params.set("contextLength", stableOptions.contextLength.toString());
      if (stableOptions.fullContextLength)
        params.set(
          "fullContextLength",
          stableOptions.fullContextLength.toString()
        );
      if (stableOptions.minConfidence)
        params.set("minConfidence", stableOptions.minConfidence.toString());
      if (stableOptions.includePronounMatches)
        params.set("includePronounMatches", "true");
      if (stableOptions.caseSensitive) params.set("caseSensitive", "true");

      // Add additional params
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.set(key, value.toString());
        }
      });

      return params.toString();
    },
    [stableOptions] // ✅ Now depends on memoized options
  );

  // ===== LOAD MENTIONS =====
  const loadMentions = useCallback(
    async (page: number = 1) => {
      if (!characterId || !novelId) return;

      try {
        setIsLoading(true);
        setError(null);

        const queryParams = buildQueryParams({ page, limit: 20 });
        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}/mentions?${queryParams}`
        );

        if (!response.ok) {
          throw new Error("Failed to load character mentions");
        }

        const data = await response.json();

        if (data.success) {
          setMentions(data.data.mentions || []);
          setPagination(data.data.pagination || null);
        } else {
          throw new Error(data.error || "Failed to load character mentions");
        }
      } catch (err) {
        console.error("Error loading character mentions:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setMentions([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    },
    [characterId, novelId, buildQueryParams]
  );

  // ===== ANALYZE MENTIONS =====
  const analyzeMentions = useCallback(async () => {
    if (!characterId || !novelId) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      const queryParams = buildQueryParams();
      const response = await fetch(
        `/api/novels/${novelId}/characters/${characterId}/analytics?${queryParams}`
      );

      if (!response.ok) {
        throw new Error("Failed to analyze character mentions");
      }

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data.analytics);
      } else {
        throw new Error(data.error || "Failed to analyze character mentions");
      }
    } catch (err) {
      console.error("Error analyzing character mentions:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsAnalyzing(false);
    }
  }, [characterId, novelId, buildQueryParams]);

  // ===== SEARCH MENTIONS =====
  const searchMentions = useCallback(
    async (search: string) => {
      if (!characterId || !novelId || !search.trim()) return;

      try {
        setIsSearching(true);
        setError(null);
        setSearchTerm(search);

        const queryParams = buildQueryParams({ search: search.trim() });
        const response = await fetch(
          `/api/novels/${novelId}/characters/${characterId}/mentions?${queryParams}`
        );

        if (!response.ok) {
          throw new Error("Failed to search character mentions");
        }

        const data = await response.json();

        if (data.success) {
          setMentions(data.data.mentions || []);
          setPagination(null); // Search results don't use pagination
        } else {
          throw new Error(data.error || "Failed to search character mentions");
        }
      } catch (err) {
        console.error("Error searching character mentions:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setMentions([]);
      } finally {
        setIsSearching(false);
      }
    },
    [characterId, novelId, buildQueryParams]
  );

  // ===== CLEAR SEARCH =====
  const clearSearch = useCallback(() => {
    setSearchTerm("");
    loadMentions(1); // Reset to page 1
  }, [loadMentions]);

  // ✅ FIX 2: Remove function dependencies from useEffect
  // Only trigger on characterId/novelId changes
  useEffect(() => {
    if (characterId && novelId) {
      // Reset state when switching characters
      setMentions([]);
      setAnalytics(null);
      setError(null);
      setSearchTerm("");
      setPagination(null);

      // Load initial data
      loadMentions(1);
      analyzeMentions();
    }
  }, [characterId, novelId]); // ✅ Only depend on IDs, not functions

  return {
    // State
    mentions,
    analytics,
    isLoading,
    isAnalyzing,
    error,
    pagination,

    // Actions
    loadMentions,
    analyzeMentions,
    searchMentions,
    clearSearch,

    // Search state
    searchTerm,
    isSearching,
  };
}
