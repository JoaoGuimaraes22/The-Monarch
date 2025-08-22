// app/components/characters/index.ts
// Barrel exports for character components

// Main page content
export { CharactersPageContent } from "./characters-page-content";

// Header components
export { CharactersHeader } from "./characters-header";
export { CharactersStatsBar } from "./characters-stats-bar";
export { CharactersSearchBar } from "./characters-search-bar";

// Grid and cards
export { CharactersGrid } from "./characters-grid";
export { CharacterCard } from "./character-card";

// State components
export { CharactersEmptyState } from "./characters-empty-state";
export { CharactersLoadingState } from "./characters-loading-state";
export { CharactersErrorState } from "./characters-error-state";

// Dialogs
export { CreateCharacterDialog } from "./create-character-dialog";

// Types
export type { CharacterWithCurrentState } from "@/lib/characters/character-service";
