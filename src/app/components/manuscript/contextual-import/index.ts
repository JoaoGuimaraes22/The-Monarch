// src/app/components/manuscript/contextual-import/index.ts
// Barrel exports for the contextual import system

// ===== MAIN COMPONENTS =====
export { default as ContextualImportDialog } from "./contextual-import-dialog";

// ===== UTILITY FUNCTIONS =====
export { createImportContext } from "./utils";
export { validateImportTarget } from "./utils";
export { formatImportDescription } from "./utils";

// ===== NEW SELECTION HELPERS =====
export { getTargetDisplayText } from "./utils";
export { getChaptersForAct } from "./utils";
export { getScenesForChapter } from "./utils";

// ===== POSITION HELPERS =====
export { calculatePositionBumping } from "./utils";
export { getAvailablePositions } from "./utils";

// ===== FILE & PREVIEW HELPERS =====
export { validateImportFile } from "./utils";
export { calculateMergePreview } from "./utils";

// ===== HOOKS =====
export { useContextualImport } from "@/hooks/manuscript/useContextualImport";

// ===== TYPES =====
export type {
  ImportContext,
  ImportTarget,
  ContextualImportOptions,
  ContextualImportResult,
  ImportStep,
  ImportDialogState,
  ContextualImportDialogProps,
  ImportModeCardProps,
  TargetSelectorProps,
  FileUploaderProps,
  ImportPreviewProps,
  MergeStrategy,
  MergeConflict,
  MergePreview,
  EnhancedAutoSaveToolsProps,
  ContextualImportRequest,
  ContextualImportResponse,
  ImportMode,
  ImportPosition,
  ViewMode,
} from "./types";

// ===== TYPE GUARDS =====
export {
  isNewContentMode,
  isReplaceMode,
  requiresTargetSelection,
  requiresPositionSelection,
  isSceneMode,
  isActMode,
  isChapterMode,
} from "./types";

/*
===== IMPLEMENTATION STATUS =====

✅ CREATED:
- types.ts                         # TypeScript interfaces
- utils.ts                         # ✅ UPDATED: Clean explicit selection utils
- contextual-import-dialog.tsx     # Main dialog component
- index.ts                         # ✅ UPDATED: Complete exports

⏳ NOT CREATED YET (commented out):
- import-mode-selector.tsx         # Will create later
- target-selector.tsx              # Will create later
- document-uploader.tsx            # Will create later
- import-preview.tsx               # Will create later
- hooks/useContextualImport.ts     # Will create later
- hooks/useImportDialog.ts         # Will create later

===== NEW EXPORTS ADDED =====

✅ Selection Helpers:
- getTargetDisplayText()          # Format "Act 1 • Title" display
- getChaptersForAct()             # Get chapters for selected act
- getScenesForChapter()           # Get scenes for selected chapter

✅ Position Helpers:
- calculatePositionBumping()      # Show what moves when inserting
- getAvailablePositions()         # Generate Beginning/End/Precision options

✅ File & Preview:
- validateImportFile()            # File validation
- calculateMergePreview()         # Structure preview

✅ Enhanced Type Guards:
- isReplaceMode()                 # Added missing replace mode guard
- requiresPositionSelection()     # Added position requirement guard

===== CURRENT FOCUS =====

Getting the basic integration working with:
1. ContextualImportDialog (✅ working)
2. Utility functions (✅ updated & clean)
3. Complete barrel exports (✅ updated)
4. Integration with CompactAutoSaveTools (⏳ next step)

Once we confirm the basic dialog opens and works, we'll add the missing components.
*/
