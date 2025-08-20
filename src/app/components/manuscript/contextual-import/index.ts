// src/app/components/manuscript/contextual-import/index.ts
// Barrel exports for the contextual import system

// ===== MAIN COMPONENTS =====
export { default as ContextualImportDialog } from "./contextual-import-dialog";

// ===== UTILITY FUNCTIONS =====
export { createImportContext } from "./utils";
export { validateImportTarget } from "./utils";
export { formatImportDescription } from "./utils";
export { determineViewMode } from "./utils";

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
  isContextualMode,
  requiresTargetSelection,
  isSceneMode,
  isActMode,
  isChapterMode,
} from "./types";

/*
===== IMPLEMENTATION STATUS =====

✅ CREATED:
- types.ts                         # TypeScript interfaces
- utils.ts                         # Utility functions (fixed)
- contextual-import-dialog.tsx     # Main dialog component
- index.ts                         # This file - cleaned up

⏳ NOT CREATED YET (commented out):
- import-mode-selector.tsx         # Will create later
- target-selector.tsx              # Will create later
- document-uploader.tsx            # Will create later
- import-preview.tsx               # Will create later
- hooks/useContextualImport.ts     # Will create later
- hooks/useImportDialog.ts         # Will create later

===== CURRENT FOCUS =====

Getting the basic integration working with:
1. ContextualImportDialog (✅ working)
2. Utility functions (✅ fixed)
3. Integration with CompactAutoSaveTools (⏳ next step)

Once we confirm the basic dialog opens and works, we'll add the missing components.
*/
