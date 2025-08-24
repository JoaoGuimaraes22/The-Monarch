// lib/characters/character-text-analyzer.ts
// Improved character mention detection with conservative name variations for better accuracy

import type { CharacterWithParsedTitles } from "@/lib/characters/character-service";

// ===== TYPES =====
export interface CharacterMention {
  sceneId: string;
  characterId: string;
  mentionText: string;
  startPosition: number;
  endPosition: number;
  contextBefore: string;
  contextAfter: string;
  fullContext: string;
  mentionType: "name" | "title" | "pronoun" | "description";
  confidence: number;
  lineNumber?: number;
}

export interface TextAnalysisOptions {
  contextLength?: number; // Characters before/after mention
  fullContextLength?: number; // Full context snippet length
  minConfidence?: number; // Minimum confidence threshold
  includePronounMatches?: boolean; // Include pronoun detection (recommended: false)
  caseSensitive?: boolean; // Case sensitive matching
}

interface CharacterNameVariations {
  characterId: string;
  variations: string[]; // Conservative name variations only
  pronouns: string[]; // Keep for legacy but won't use
  titles: string[]; // Only explicit titles
  nicknames: string[]; // Only explicit nicknames
}

// ===== CHARACTER TEXT ANALYZER =====
export class CharacterTextAnalyzer {
  private static readonly DEFAULT_OPTIONS: Required<TextAnalysisOptions> = {
    contextLength: 50,
    fullContextLength: 200,
    minConfidence: 0.8, // ✅ ACCURACY: Raised default threshold
    includePronounMatches: false, // ✅ ACCURACY: Disabled by default
    caseSensitive: false,
  };

  /**
   * ✅ ACCURACY IMPROVEMENT: Generate conservative name variations with character titles
   * Now uses titles from character profile data
   */
  private static generateNameVariations(
    character: CharacterWithParsedTitles
  ): CharacterNameVariations {
    const variations = new Set<string>();
    const titles = new Set<string>();
    const nicknames = new Set<string>();
    const pronouns = new Set<string>(); // Keep for legacy, but won't use

    // ===== CORE NAME VARIATIONS (High Confidence) =====

    // Full name
    if (character.name) {
      variations.add(character.name);

      // First name only (if multi-part name)
      const nameParts = character.name.split(/\s+/);
      if (nameParts.length > 1) {
        variations.add(nameParts[0]); // First name
        // Add last name only if it's unique enough (length > 2)
        const lastName = nameParts[nameParts.length - 1];
        if (lastName.length > 2) {
          variations.add(lastName);
        }
      }
    }

    // ===== CHARACTER PROFILE TITLES (Medium-High Confidence) =====

    // ✅ NEW: Use titles from character profile (now properly typed)
    if (character.titles && Array.isArray(character.titles)) {
      character.titles.forEach((title) => {
        if (title && title.trim().length > 0) {
          const cleanTitle = title.trim();
          titles.add(cleanTitle);
          variations.add(cleanTitle);

          // Also add title without articles if present
          const withoutArticles = cleanTitle.replace(/^(the|a|an)\s+/i, "");
          if (withoutArticles !== cleanTitle && withoutArticles.length > 2) {
            variations.add(withoutArticles);
          }
        }
      });
    }

    // ===== FALLBACK: EXPLICIT TITLES FROM NOTES (Low Priority) =====

    // Keep existing note parsing as fallback for legacy data
    if (character.writerNotes) {
      const titleMatches = character.writerNotes.match(
        /(?:title|called|known as):\s*([^,\n\.]+)/gi
      );
      if (titleMatches) {
        titleMatches.forEach((match) => {
          const title = match
            .replace(/(?:title|called|known as):\s*/gi, "")
            .trim();
          if (title.length > 2) {
            titles.add(title);
            variations.add(title);
          }
        });
      }
    }

    // ===== REMOVE PROBLEMATIC VARIATIONS =====
    // These cause too many false positives:
    // - Generic species terms: "the human", "the elf"
    // - Appearance terms: "the tall man", "the young woman"
    // - Common titles: "the captain", "the lord" (unless explicit)
    // - Age/gender combinations: "the old man"

    // ===== STRICTER NICKNAME HANDLING =====
    // Only add nicknames if they're explicitly defined or very unique
    // TODO: Could parse character relationships for established nicknames

    // ===== LEGACY PRONOUNS (Not Used) =====
    // Keep this for interface compatibility, but includePronounMatches should be false
    if (character.gender) {
      const gender = character.gender.toLowerCase();
      if (gender.includes("male") && !gender.includes("female")) {
        pronouns.add("he");
        pronouns.add("him");
        pronouns.add("his");
      } else if (gender.includes("female")) {
        pronouns.add("she");
        pronouns.add("her");
        pronouns.add("hers");
      }
    }

    return {
      characterId: character.id,
      variations: Array.from(variations),
      pronouns: Array.from(pronouns),
      titles: Array.from(titles),
      nicknames: Array.from(nicknames),
    };
  }

  /**
   * ✅ ACCURACY IMPROVEMENT: Smarter confidence scoring
   * Penalizes common words, rewards unique names
   */
  private static calculateConfidence(
    matchedText: string,
    character: CharacterWithParsedTitles,
    content: string,
    position: number
  ): number {
    let confidence = 0.8; // Base confidence

    // ===== BOOST CONFIDENCE =====

    // Exact full name match
    if (matchedText === character.name) {
      confidence += 0.15;
    }

    // Capitalized words (proper nouns)
    if (/^[A-Z]/.test(matchedText)) {
      confidence += 0.05;
    }

    // Longer names are more unique
    if (matchedText.length >= 6) {
      confidence += 0.05;
    }

    // Multiple words (full names)
    if (matchedText.includes(" ")) {
      confidence += 0.1;
    }

    // ===== PENALIZE CONFIDENCE =====

    // Very common words
    const commonWords = [
      "will",
      "may",
      "rose",
      "grace",
      "hope",
      "joy",
      "faith",
    ];
    if (commonWords.includes(matchedText.toLowerCase())) {
      confidence -= 0.3;
    }

    // Single letter names
    if (matchedText.length === 1) {
      confidence -= 0.4;
    }

    // Very short names (2 chars) are often false positives
    if (matchedText.length === 2) {
      confidence -= 0.2;
    }

    // ===== CONTEXT ANALYSIS =====

    // Extract surrounding context for analysis
    const contextStart = Math.max(0, position - 100);
    const contextEnd = Math.min(
      content.length,
      position + matchedText.length + 100
    );
    const surroundingContext = content
      .substring(contextStart, contextEnd)
      .toLowerCase();

    // Boost if mentioned with other character names (dialogue context)
    if (
      surroundingContext.includes(" said ") ||
      surroundingContext.includes(" asked ") ||
      surroundingContext.includes(" replied ")
    ) {
      confidence += 0.1;
    }

    // Penalize if in middle of larger word (partial matches)
    const beforeChar = position > 0 ? content[position - 1] : " ";
    const afterChar =
      position + matchedText.length < content.length
        ? content[position + matchedText.length]
        : " ";

    if (/[a-zA-Z]/.test(beforeChar) || /[a-zA-Z]/.test(afterChar)) {
      confidence -= 0.3; // This is a partial word match
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * ✅ ACCURACY IMPROVEMENT: Remove pronoun confidence calculation
   * Since we're not using pronouns anymore, this can be simplified or removed
   */
  private static calculatePronounConfidence(
    pronoun: string,
    character: CharacterWithParsedTitles,
    content: string,
    position: number
  ): number {
    // Always return low confidence since we don't want pronouns
    return 0.1;
  }

  /**
   * Find all character mentions in text
   * ✅ ACCURACY: Improved with conservative variations and stricter matching
   */
  static findCharacterMentions(
    content: string,
    character: CharacterWithParsedTitles,
    sceneId: string,
    options: TextAnalysisOptions = {}
  ): CharacterMention[] {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const mentions: CharacterMention[] = [];
    const nameVariations = this.generateNameVariations(character);

    // ===== CONSERVATIVE NAME MATCHING =====
    nameVariations.variations.forEach((variation) => {
      const matches = this.findTextMatches(content, variation, opts);

      matches.forEach((match) => {
        const confidence = this.calculateConfidence(
          match.matchedText,
          character,
          content,
          match.startPosition
        );

        // Only include mentions above confidence threshold
        if (confidence >= opts.minConfidence) {
          const mention: CharacterMention = {
            sceneId,
            characterId: character.id,
            mentionText: match.matchedText,
            startPosition: match.startPosition,
            endPosition: match.endPosition,
            contextBefore: this.extractContext(
              content,
              match.startPosition,
              -opts.contextLength
            ),
            contextAfter: this.extractContext(
              content,
              match.endPosition,
              opts.contextLength
            ),
            fullContext: this.extractFullContext(
              content,
              match.startPosition,
              match.endPosition,
              opts.fullContextLength
            ),
            mentionType: this.determineMentionType(variation, nameVariations),
            confidence,
            lineNumber: this.getLineNumber(content, match.startPosition),
          };

          mentions.push(mention);
        }
      });
    });

    // ===== SKIP PRONOUN MATCHING =====
    // Even if includePronounMatches is true, we skip it for accuracy
    // This prevents any pronoun matches from being included

    // Sort by position and remove overlapping matches
    return this.deduplicateMatches(
      mentions.sort((a, b) => a.startPosition - b.startPosition)
    );
  }

  /**
   * Find all occurrences of a text pattern with word boundaries
   */
  private static findTextMatches(
    content: string,
    pattern: string,
    options: Required<TextAnalysisOptions>
  ): Array<{
    matchedText: string;
    startPosition: number;
    endPosition: number;
  }> {
    const matches: Array<{
      matchedText: string;
      startPosition: number;
      endPosition: number;
    }> = [];
    const flags = options.caseSensitive ? "g" : "gi";

    // ✅ ACCURACY: Better regex for word boundaries
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // More sophisticated word boundary detection
    // Handles apostrophes and hyphens within names
    const regex = new RegExp(`(?<![\w'-])${escapedPattern}(?![\w'-])`, flags);

    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        matchedText: match[0],
        startPosition: match.index,
        endPosition: match.index + match[0].length,
      });

      // Prevent infinite loop
      if (!regex.global) break;
    }

    return matches;
  }

  /**
   * Extract context around a position
   */
  private static extractContext(
    content: string,
    position: number,
    length: number
  ): string {
    if (length < 0) {
      // Extract before position
      const start = Math.max(0, position + length);
      return content.substring(start, position).trim();
    } else {
      // Extract after position
      const end = Math.min(content.length, position + length);
      return content.substring(position, end).trim();
    }
  }

  /**
   * Extract full context around a mention
   */
  private static extractFullContext(
    content: string,
    startPosition: number,
    endPosition: number,
    contextLength: number
  ): string {
    const halfLength = Math.floor(contextLength / 2);
    const start = Math.max(0, startPosition - halfLength);
    const end = Math.min(content.length, endPosition + halfLength);

    return content.substring(start, end).trim();
  }

  /**
   * Determine the type of mention based on the matched text
   */
  private static determineMentionType(
    matchedText: string,
    nameVariations: CharacterNameVariations
  ): CharacterMention["mentionType"] {
    if (nameVariations.pronouns.includes(matchedText.toLowerCase())) {
      return "pronoun"; // Won't be used since pronouns are disabled
    }

    if (nameVariations.titles.includes(matchedText)) {
      return "title";
    }

    if (nameVariations.nicknames.includes(matchedText)) {
      return "name"; // Treat nicknames as names
    }

    // Default to name for most matches
    return "name";
  }

  /**
   * Get line number for a position in text
   */
  private static getLineNumber(content: string, position: number): number {
    const beforePosition = content.substring(0, position);
    return beforePosition.split("\n").length;
  }

  /**
   * Remove overlapping and duplicate matches
   * ✅ ACCURACY: Prefer higher confidence matches in overlaps
   */
  private static deduplicateMatches(
    mentions: CharacterMention[]
  ): CharacterMention[] {
    const deduplicated: CharacterMention[] = [];

    for (const mention of mentions) {
      // Check for overlaps with existing mentions
      const overlappingIndex = deduplicated.findIndex(
        (existing) =>
          mention.startPosition < existing.endPosition &&
          mention.endPosition > existing.startPosition
      );

      if (overlappingIndex === -1) {
        // No overlap, add the mention
        deduplicated.push(mention);
      } else {
        // Overlap detected - keep the one with higher confidence
        if (mention.confidence > deduplicated[overlappingIndex].confidence) {
          deduplicated[overlappingIndex] = mention;
        }
        // Otherwise, keep the existing one (don't add the new one)
      }
    }

    return deduplicated;
  }
}
