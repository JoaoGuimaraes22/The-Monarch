// hooks/characters/relationships/index.ts
// Barrel exports for relationship hooks following your established patterns

// ===== MAIN HOOKS =====
export { useCharacterRelationships } from "./useCharacterRelationships";
export { useRelationshipStates } from "./useRelationshipStates";

// ===== SIMPLIFIED HOOKS =====
export { useCreateRelationship } from "./useCreateRelationship";
export { useCreateRelationshipState } from "./useCreateRelationshipState";

// ===== TYPE EXPORTS =====
export type { UseCharacterRelationshipsReturn } from "./useCharacterRelationships";
export type { UseRelationshipStatesReturn } from "./useRelationshipStates";
export type { UseCreateRelationshipReturn } from "./useCreateRelationship";
export type { UseCreateRelationshipStateReturn } from "./useCreateRelationshipState";

/*
===== RELATIONSHIP HOOKS ARCHITECTURE =====

Following your established patterns from character hooks:

✅ MAIN HOOKS (Public API):
- useCharacterRelationships: Complete relationship management for a character
- useRelationshipStates: Relationship state management with CRUD operations

✅ SIMPLIFIED HOOKS (Dialog/Component Level):
- useCreateRelationship: Simplified hook for relationship creation dialogs
- useCreateRelationshipState: Simplified hook for state creation dialogs

✅ MODULAR DESIGN:
- Each hook has a single responsibility
- Clean separation between relationships and relationship states
- Type-safe interfaces throughout

✅ ESTABLISHED PATTERNS:
- Similar to useCharacters/useCharacterStates hook family
- Consistent error handling and loading states
- Optimistic updates for better UX

===== USAGE PATTERNS =====

// Character relationships section
const relationshipsHook = useCharacterRelationships(novelId, characterId);

// Relationship detail page (full states management)
const statesHook = useRelationshipStates(novelId, characterId, relationshipId);

// Create relationship dialog (simplified)
const { createRelationship, isCreating } = useCreateRelationship(novelId, characterId);

// Create relationship state dialog (simplified)
const { createState, isCreating } = useCreateRelationshipState(novelId, characterId, relationshipId);

===== FEATURES =====

🔄 OPTIMISTIC UPDATES: Immediate UI feedback
⚡ LOADING STATES: Granular loading indicators
🛡️ ERROR HANDLING: Comprehensive error management
🔄 BIDIRECTIONAL: Handles reciprocal relationship creation
📊 TYPE SAFETY: Full TypeScript coverage
🎯 CONSISTENT: Follows your established hook patterns
*/
