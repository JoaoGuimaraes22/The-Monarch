// src/hooks/manuscript/index.ts
// Barrel exports for manuscript hooks - now with modular architecture

// ===== MAIN HOOKS (Public API) =====
export { useManuscriptLogic } from "./useManuscriptLogic";
export { useManuscriptState } from "./useManuscriptState";
export { useManuscriptCRUD } from "./useManuscriptCRUD";
export { useAutoSave } from "./useAutoSave";
export { useContextualImport } from "./useContextualImport";

// ===== MODULAR HOOKS (Available for advanced use cases) =====
export { useManuscriptSelection } from "./useManuscriptSelection";
export { useManuscriptNavigation } from "./useManuscriptNavigation";
export { useManuscriptUpdates } from "./useManuscriptUpdates";
export { useManuscriptUtils } from "./useManuscriptUtils";

// ===== TYPE EXPORTS =====
// Main hook types
export type { ManuscriptLogicReturn } from "./useManuscriptLogic";
export type {
  ManuscriptState,
  ManuscriptStateActions,
  ManuscriptStateReturn,
} from "./useManuscriptState";
export type { CRUDConfig, CRUDActions } from "./useManuscriptCRUD";
export type {
  AutoSaveState,
  AutoSaveActions,
  AutoSaveConfig,
  AutoSaveReturn,
} from "./useAutoSave";

// Modular hook types
export type {
  SelectionConfig,
  SelectionHandlers,
  SelectionUtils,
  ManuscriptSelectionReturn,
} from "./useManuscriptSelection";

export type {
  NavigationConfig,
  NavigationContext,
  NavigationLevel,
  NavigationItem,
  NavigationHandlers,
} from "./useManuscriptNavigation";

export type { UpdateConfig, UpdateHandlers } from "./useManuscriptUpdates";

export type { UtilsConfig, UtilityHelpers } from "./useManuscriptUtils";

/*
===== MODULAR ARCHITECTURE BENEFITS =====

✅ SEPARATION OF CONCERNS:
- useManuscriptLogic: Main orchestrator
- useManuscriptSelection: Selection logic
- useManuscriptNavigation: Navigation behavior
- useManuscriptUpdates: API update handlers
- useManuscriptUtils: Utility functions

✅ MAINTAINABILITY:
- Each hook has single responsibility
- Easy to find and modify specific functionality
- Better testing isolation
- Clear dependencies

✅ REUSABILITY:
- Components can use sub-hooks directly if needed
- Navigation logic available for other features
- Selection utilities can be shared

✅ EXTENSIBILITY:
- Easy to add keyboard shortcuts to navigation
- Simple to add navigation history/bookmarks
- Clear place for new navigation features

===== USAGE PATTERNS =====

// Standard usage (most components)
const manuscript = useManuscriptLogic(novelId);

// Advanced usage (specialized components)
const navigation = useManuscriptNavigation(config);
const selection = useManuscriptSelection(config);

// Testing usage (unit tests)
import { useManuscriptNavigation } from '@/hooks/manuscript';
*/
