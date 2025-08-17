// src/lib/doc-parse/index.ts
// Main exports for the document parsing system

// Main classes
export { EnhancedDocxParser } from "./enhanced-docx-parser";
export { AutoFixService } from "./auto-fix-service";
export { StructureAnalyzer } from "./structure-analyzer";

// Detectors
export { ActDetector } from "./detectors/act-detector";
export { ChapterDetector } from "./detectors/chapter-detector";
export { SceneDetector } from "./detectors/scene-detector";

// Utilities
export { HtmlConverter } from "./utils/html-converter";

// Types
export type {
  ParsedStructure,
  ParsedAct,
  ParsedChapter,
  ParsedScene,
  StructureIssue,
  AutoFixAction,
  AutoFixResult,
  AutoFixOptions,
  ValidationResult,
  ParseContext,
  DetectionResult,
} from "./types";

// For backward compatibility, alias the main parser
export const DocumentAutoFixService = AutoFixService;
