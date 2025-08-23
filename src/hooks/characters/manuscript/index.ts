// hooks/characters/manuscript/index.ts
// Barrel exports for character manuscript hooks

// ===== MAIN HOOKS =====
export { useCharacterMentions } from "./useCharacterMentions";

// ===== TYPE EXPORTS =====
export type {
  UseCharacterMentionsReturn,
  MentionAnalysisOptions,
} from "./useCharacterMentions";

/*
===== CHARACTER MANUSCRIPT HOOKS =====

Following your established hook patterns:

✅ MAIN HOOKS (Public API):
- useCharacterMentions: Complete character mention detection and analysis

✅ MODULAR DESIGN:
- Single responsibility for manuscript integration
- Text analysis options configuration
- Pagination and search support
- Loading states for all operations

✅ ESTABLISHED PATTERNS:
- Similar to useCharacters/useCharacterStates hook family
- Consistent error handling and loading states
- useCallback for memoized functions
- Parameter object patterns

===== USAGE PATTERNS =====

// Character manuscript section
const { 
  mentions, 
  analytics, 
  isLoading, 
  searchMentions, 
  analyzeMentions 
} = useCharacterMentions(characterId, novelId, {
  contextLength: 50,
  minConfidence: 0.8
});

// Search functionality
await searchMentions("said something");

// Analytics
await analyzeMentions();

===== FEATURES =====

🔍 SMART DETECTION: Intelligent character name variation matching
📊 ANALYTICS: Comprehensive mention distribution analysis
🔄 PAGINATION: Efficient handling of large manuscripts
🔎 SEARCH: Context-based mention searching
⚡ LOADING STATES: Granular loading indicators
🛡️ ERROR HANDLING: Comprehensive error management
📈 TYPE SAFETY: Full TypeScript coverage
🎯 CONSISTENT: Follows your established hook patterns
*/
