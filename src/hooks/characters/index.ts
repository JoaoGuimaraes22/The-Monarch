// hooks/characters/index.ts
// Barrel exports for character hooks - following your established patterns

// ===== MAIN HOOKS =====
export { useCharacters } from "./useCharacters";
export {
  useCharacterStates,
  useCreateCharacterState,
  useUpdateCharacterState, // ✅ NEW: Add this export
  useDeleteCharacterState, // ✅ NEW: Add this export
} from "./useCharacterStates";

// ===== TYPE EXPORTS =====
export type { UseCharacterStatesReturn } from "./useCharacterStates";

/*
===== CHARACTER HOOKS ARCHITECTURE =====

Following your established patterns from manuscript hooks:

✅ MAIN HOOKS (Public API):
- useCharacters: Complete character management for a novel
- useCharacterStates: Character state management with CRUD operations
- useCreateCharacterState: Simplified hook for character detail page
- useUpdateCharacterState: Simplified hook for updating states
- useDeleteCharacterState: Simplified hook for deleting states

✅ MODULAR DESIGN:
- Each hook has a single responsibility
- Clean separation between character and state management
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
*/
