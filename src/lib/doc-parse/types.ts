// src/lib/doc-parse/types.ts
// Centralized type definitions for document parsing

export interface ParsedStructure {
  acts: ParsedAct[];
  wordCount: number;
  issues?: StructureIssue[];
}

export interface ParsedAct {
  title: string;
  order: number;
  chapters: ParsedChapter[];
}

export interface ParsedChapter {
  title: string;
  order: number;
  scenes: ParsedScene[];
}

export interface ParsedScene {
  content: string;
  order: number;
  wordCount: number;
}

export interface StructureIssue {
  type: string;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion?: string;
  autoFixable: boolean;
  fixAction?: AutoFixAction;
}

export interface AutoFixAction {
  type:
    | "renumber_chapters"
    | "renumber_scenes"
    | "combine_scenes"
    | "split_scenes"
    | "rename_duplicate";
  description: string;
  targetId?: string;
}

export interface AutoFixResult {
  success: boolean;
  message: string;
  fixedStructure?: ParsedStructure;
  error?: string;
}

export interface AutoFixOptions {
  combineShortScenes?: boolean;
  splitLongScenes?: boolean;
  renumberChapters?: boolean;
  renumberScenes?: boolean;
  renameDuplicates?: boolean;
  minimumSceneLength?: number;
  maximumSceneLength?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: StructureIssue[];
}

// Internal types for parsing
export interface ParseContext {
  acts: ParsedAct[];
  currentAct: ParsedAct | null;
  currentChapter: ParsedChapter | null;
  currentSceneContent: string[];
  actOrder: number;
  chapterOrder: number;
  sceneOrder: number;
  originalChapterTitles: string[];
}

export interface DetectionResult {
  detected: boolean;
  content?: string;
  extractedTitle?: string;
}
