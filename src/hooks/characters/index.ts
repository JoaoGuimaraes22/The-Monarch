// hooks/characters/index.ts
// Barrel exports for character hooks - following your established patterns

// ===== MAIN HOOKS =====
export { useCharacters } from "./useCharacters";
export {
  useCharacterStates,
  useCreateCharacterState,
  useUpdateCharacterState,
  useDeleteCharacterState,
} from "./useCharacterStates";

// ===== RELATIONSHIP HOOKS =====
export {
  useCharacterRelationships,
  useRelationshipStates,
  useCreateRelationship,
  useCreateRelationshipState,
} from "./relationships";

// ===== TYPE EXPORTS =====
export type { UseCharacterStatesReturn } from "./useCharacterStates";
export type {
  UseCharacterRelationshipsReturn,
  UseRelationshipStatesReturn,
  UseCreateRelationshipReturn,
  UseCreateRelationshipStateReturn,
} from "./relationships";

/*
===== CHARACTER HOOKS ARCHITECTURE =====

Following your established patterns from manuscript hooks:

✅ MAIN HOOKS (Public API):
- useCharacters: Complete character management for a novel
- useCharacterStates: Character state management with CRUD operations
- useCreateCharacterState: Simplified hook for character detail page
- useUpdateCharacterState: Simplified hook for updating states
- useDeleteCharacterState: Simplified hook for deleting states

✅ RELATIONSHIP HOOKS (New):
- useCharacterRelationships: Complete relationship management for a character
- useRelationshipStates: Relationship state management with CRUD operations
- useCreateRelationship: Simplified hook for relationship creation dialogs
- useCreateRelationshipState: Simplified hook for state creation dialogs

✅ MODULAR DESIGN:
- Each hook has a single responsibility
- Clean separation between character and state management
- Clean separation between characters and relationships
- Type-safe interfaces throughout

✅ ESTABLISHED PATTERNS:
- Similar to useManuscript* hook family
- Consistent error handling and loading states
- Optimistic updates for better UX

===== USAGE PATTERNS =====

// Main characters page
const { characters, createCharacter, deleteCharacter } = useCharacters(novelId);

// Character detail page (full states management)
const statesHook = useCharacterStates(initialStates);

// Character detail page (simplified hooks)
const { createState, isCreating } = useCreateCharacterState(novelId, characterId);
const { updateState, isUpdating } = useUpdateCharacterState(novelId, characterId);
const { deleteState, isDeleting } = useDeleteCharacterState(novelId, characterId);

// Character relationships (new)
const relationshipsHook = useCharacterRelationships(novelId, characterId);
const statesHook = useRelationshipStates(novelId, characterId, relationshipId);
const { createRelationship, isCreating } = useCreateRelationship(novelId, characterId);
const { createState, isCreating } = useCreateRelationshipState(novelId, characterId, relationshipId);
*/
