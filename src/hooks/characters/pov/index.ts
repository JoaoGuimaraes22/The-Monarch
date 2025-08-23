// hooks/characters/pov/index.ts
// Barrel exports for POV hooks following established patterns

// ===== MAIN HOOKS =====
export { usePOVAssignments } from "./usePOVAssignments";
export { useCharacterPOV } from "./useCharacterPOV";

// ===== SIMPLIFIED HOOKS =====
export { useCreatePOVAssignment } from "./useCreatePOVAssignment";

// ===== TYPE EXPORTS =====
export type { UsePOVAssignmentsReturn } from "./usePOVAssignments";
export type { UseCharacterPOVReturn } from "./useCharacterPOV";
export type { UseCreatePOVAssignmentReturn } from "./useCreatePOVAssignment";

/*
===== POV HOOKS ARCHITECTURE =====

Following your established patterns from character hooks:

✅ MAIN HOOKS (Public API):
- usePOVAssignments: Complete POV management for a novel
- useCharacterPOV: Character-specific POV queries and analysis

✅ SIMPLIFIED HOOKS (Dialog/Component Level):
- useCreatePOVAssignment: Simplified hook for POV creation dialogs
- Additional hooks can be added as needed (update, delete)

✅ MODULAR DESIGN:
- Each hook has a single responsibility
- Clean separation between novel-wide and character-specific POV management
- Type-safe interfaces throughout

✅ ESTABLISHED PATTERNS:
- Similar to useCharacters/useCharacterStates hook family
- Consistent error handling and loading states
- Optimistic updates for better UX
- useCallback for memoized functions
- Parameter object patterns

===== USAGE PATTERNS =====

// Novel POV management page
const { 
  assignments, 
  statistics, 
  createAssignment, 
  deleteAssignment 
} = usePOVAssignments(novelId);

// Character detail page (POV analysis)
const { 
  hasPOV, 
  getPrimaryPOVAssignments, 
  isPOVCharacterForScope 
} = useCharacterPOV(characterId);

// Create POV assignment dialog (simplified)
const { 
  createAssignment, 
  isCreating, 
  error 
} = useCreatePOVAssignment(novelId);

===== FEATURES =====

🔄 OPTIMISTIC UPDATES: Immediate UI feedback
⚡ LOADING STATES: Granular loading indicators
🛡️ ERROR HANDLING: Comprehensive error management
📊 TYPE SAFETY: Full TypeScript coverage
🎯 CONSISTENT: Follows your established hook patterns
🔍 QUERY HELPERS: Rich querying and analysis methods
*/
