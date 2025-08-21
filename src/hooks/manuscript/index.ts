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
export { useManuscriptNavigation } from "./navigation/useManuscriptNavigation";
export { useManuscriptUpdates } from "./useManuscriptUpdates";
export { useManuscriptUtils } from "./useManuscriptUtils";
export { useChapterNumbering } from "./useChapterNumbering";

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

// ===== NEW NAVIGATION TYPES =====
export type {
  NavigationItem,
  PrimaryNavigation,
  SecondaryNavigation,
  SceneViewNavigation,
  ChapterViewNavigation,
  ActViewNavigation,
  NavigationContext,
  NavigationConfig,
  NavigationHandlers,
  NavigationButtonState, // ✅ ADD THIS
  NavigationButtonInfo, // ✅ ADD THIS
} from "./navigation/types";

export type { UpdateConfig, UpdateHandlers } from "./useManuscriptUpdates";

export type { UtilsConfig, UtilityHelpers } from "./useManuscriptUtils";

/*
===== MODULAR ARCHITECTURE BENEFITS =====

✅ SEPARATION OF CONCERNS:
- useManuscriptLogic: Main orchestrator
- useManuscriptSelection: Selection logic
- useManuscriptNavigation: Clean navigation with primary/secondary separation
- useManuscriptUpdates: API update handlers
- useManuscriptUtils: Utility functions

✅ NEW NAVIGATION ARCHITECTURE:
- Clear separation between selection (primary) and scrolling (secondary)
- View-specific navigation configurations
- Clean handler distinction (onSelect vs onScrollTo)

===== USAGE PATTERNS =====

// Standard usage (most components)
const manuscript = useManuscriptLogic(novelId);

// Advanced usage (specialized components)
const navigation = useManuscriptNavigation(config);
const selection = useManuscriptSelection(config);

// New navigation usage
const { getNavigationContext, selectChapter, scrollToScene } = useManuscriptNavigation(config);
const navContext = getNavigationContext();

// Testing usage (unit tests)
import { useManuscriptNavigation } from '@/hooks/manuscript';
import type { NavigationContext } from '@/hooks/manuscript';
*/
