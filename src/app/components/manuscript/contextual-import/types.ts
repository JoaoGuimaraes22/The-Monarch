// src/app/components/manuscript/contextual-import/types.ts
// TypeScript interfaces for the contextual import system

import { ParsedStructure, StructureIssue } from "@/lib/doc-parse";

// ===== CORE IMPORT CONTEXT =====
export interface ImportContext {
  novelId: string;
  novelTitle: string;
  availableActs: Array<{
    id: string;
    title: string;
    order: number;
    chapters: Array<{
      id: string;
      title: string;
      order: number;
      scenes: Array<{
        id: string;
        title: string;
        order: number;
      }>;
    }>;
  }>;
}

// ===== IMPORT TARGET CONFIGURATION =====
export interface ImportTarget {
  mode:
    | "new-act"
    | "new-chapter"
    | "new-scene"
    | "replace-act"
    | "replace-chapter"
    | "replace-scene";
  targetActId?: string;
  targetChapterId?: string;
  targetSceneId?: string;
  position: "beginning" | "end" | "specific" | "replace";
  specificPosition?: number;
}

// ===== IMPORT OPTIONS =====
export interface ContextualImportOptions {
  context: ImportContext;
  target: ImportTarget;
  file: File;
  autoFix?: boolean;
  preserveExistingStructure?: boolean;
}

// ===== IMPORT RESULTS =====
export interface ContextualImportResult {
  success: boolean;
  message: string;
  data?: {
    // Import statistics
    imported: {
      acts: number;
      chapters: number;
      scenes: number;
      wordCount: number;
    };
    // What was created/modified
    created: {
      actIds: string[];
      chapterIds: string[];
      sceneIds: string[];
    };
    // Structure information
    structure?: {
      acts: number;
      chapters: number;
      scenes: number;
      wordCount: number;
    };
    // Validation results
    validation?: {
      isValid: boolean;
      errors: string[];
      warnings: StructureIssue[];
    };
    // Auto-fix results (if applied)
    autoFixed?: boolean;
    fixApplied?: string;
    // Parsed structure for preview
    parsedStructure?: ParsedStructure;
  };
  // Error handling
  error?: string;
  details?: string[];
}

// ===== DIALOG STATES =====
export type ImportStep =
  | "mode-selection"
  | "act-selection"
  | "chapter-selection"
  | "scene-selection"
  | "position-selection"
  | "file-upload"
  | "preview"
  | "importing";

export interface ImportDialogState {
  currentStep: ImportStep;
  selectedTarget: ImportTarget | null;
  selectedFile: File | null;
  dragOver: boolean;
  isImporting: boolean;
  previewData?: ContextualImportResult;
}

// ===== COMPONENT PROPS =====
export interface ContextualImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  context: ImportContext;
  onImportSuccess: () => void;
}

export interface ImportModeCardProps {
  id: ImportTarget["mode"];
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  recommended: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface TargetSelectorProps {
  context: ImportContext;
  selectedTarget: ImportTarget;
  onTargetChange: (target: ImportTarget) => void;
}

export interface FileUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  dragOver: boolean;
  onDragOver: (over: boolean) => void;
  selectedTarget: ImportTarget;
  context: ImportContext;
}

export interface ImportPreviewProps {
  selectedFile: File;
  selectedTarget: ImportTarget;
  context: ImportContext;
  previewData?: ContextualImportResult;
  onImport: () => Promise<void>;
  isImporting: boolean;
}

// ===== MERGE STRATEGIES =====
export interface MergeStrategy {
  name: string;
  description: string;
  execute: (
    documentStructure: ParsedStructure,
    target: ImportTarget,
    context: ImportContext
  ) => Promise<ContextualImportResult>;
}

export interface MergeConflict {
  type: "duplicate-title" | "numbering-conflict" | "position-conflict";
  message: string;
  suggestion: string;
  autoFixable: boolean;
}

export interface MergePreview {
  before: {
    acts: number;
    chapters: number;
    scenes: number;
    wordCount: number;
  };
  after: {
    acts: number;
    chapters: number;
    scenes: number;
    wordCount: number;
  };
  changes: {
    newActs: string[];
    newChapters: string[];
    newScenes: string[];
    modifiedItems: string[];
  };
  conflicts: MergeConflict[];
}

// ===== AUTO-SAVE ENHANCEMENT =====
export interface EnhancedAutoSaveToolsProps {
  // Existing props
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  handleManualSave: () => Promise<void>;
  pendingChanges: boolean;
  isSavingContent: boolean;
  lastSaved: Date | null;
  novelId: string;
  onRefresh: () => void;

  // New contextual import props
  onOpenContextualImport?: () => void;
  currentContext?: {
    actTitle?: string;
    chapterTitle?: string;
    sceneTitle?: string;
    viewMode: "scene" | "chapter" | "act" | "novel";
  };
}

// ===== API REQUEST/RESPONSE TYPES =====
export interface ContextualImportRequest {
  target: ImportTarget;
  autoFix?: boolean;
  // File is sent via FormData
}

export interface ContextualImportResponse {
  success: boolean;
  message: string;
  data?: ContextualImportResult["data"];
  error?: string;
  details?: string[];
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// ===== UTILITY TYPES =====
export type ImportMode = ImportTarget["mode"];
export type ImportPosition = ImportTarget["position"];
export type ViewMode = "scene" | "chapter" | "act" | "novel";

// Type guards
export const isNewContentMode = (mode: ImportMode): boolean => {
  return mode === "new-act" || mode === "new-chapter" || mode === "new-scene";
};

export const isReplaceMode = (mode: ImportMode): boolean => {
  return (
    mode === "replace-act" ||
    mode === "replace-chapter" ||
    mode === "replace-scene"
  );
};

export const requiresTargetSelection = (mode: ImportMode): boolean => {
  return mode !== "new-act"; // Only new-act doesn't need target selection
};

export const requiresPositionSelection = (mode: ImportMode): boolean => {
  return isNewContentMode(mode); // Only new content modes need position selection
};

export const isSceneMode = (mode: ImportMode): boolean => {
  return mode === "replace-scene" || mode === "new-scene";
};

export const isActMode = (mode: ImportMode): boolean => {
  return mode === "new-act" || mode === "replace-act";
};

export const isChapterMode = (mode: ImportMode): boolean => {
  return mode === "new-chapter" || mode === "replace-chapter";
};
