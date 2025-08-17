// // src/lib/enhanced-docx-parser.ts
// // Step 1: Drop-in replacement for existing DocxParser with better detection

// import * as mammoth from "mammoth";

// export interface ParsedStructure {
//   acts: ParsedAct[];
//   wordCount: number;
//   issues?: StructureIssue[];
// }

// export interface StructureIssue {
//   type: string;
//   severity: "error" | "warning" | "info";
//   message: string;
//   suggestion?: string;
//   autoFixable: boolean;
//   fixAction?: {
//     type:
//       | "renumber_chapters"
//       | "renumber_scenes"
//       | "combine_scenes"
//       | "split_scenes"
//       | "rename_duplicate";
//     description: string;
//     targetId?: string;
//   };
// }

// export interface ParsedAct {
//   title: string;
//   order: number;
//   chapters: ParsedChapter[];
// }

// export interface ParsedChapter {
//   title: string;
//   order: number;
//   scenes: ParsedScene[];
// }

// export interface ParsedScene {
//   content: string;
//   order: number;
//   wordCount: number;
// }

// export class EnhancedDocxParser {
//   /**
//    * Enhanced parsing - drop-in replacement for DocxParser.parseDocx()
//    * Returns same format as original, but with better detection
//    */
//   static async parseDocx(file: File): Promise<ParsedStructure> {
//     try {
//       console.log("🔍 Starting enhanced parsing...");

//       // Convert document to HTML (same as before)
//       const html = await this.convertToHtml(file);

//       // Enhanced structure parsing (better detection)
//       const structure = this.parseHtmlStructureEnhanced(html);

//       // NEW: Analyze issues with auto-fix suggestions
//       const issues = this.analyzeAdvancedIssues(structure);

//       console.log("✅ Enhanced parsing completed:", {
//         acts: structure.acts.length,
//         chapters: structure.acts.reduce(
//           (sum, act) => sum + act.chapters.length,
//           0
//         ),
//         scenes: structure.acts.reduce(
//           (sum, act) =>
//             sum +
//             act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
//           0
//         ),
//         wordCount: structure.wordCount,
//         issues: issues.length,
//       });

//       return {
//         acts: structure.acts,
//         wordCount: structure.wordCount,
//         issues: issues.length > 0 ? issues : undefined,
//       };
//     } catch (error) {
//       console.error("❌ Enhanced parsing failed:", error);
//       throw new Error(
//         error instanceof Error
//           ? `Enhanced parsing failed: ${error.message}`
//           : "Enhanced parsing failed"
//       );
//     }
//   }

//   /**
//    * Convert .docx to HTML (same as original)
//    */
//   private static async convertToHtml(file: File): Promise<string> {
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     const result = await mammoth.convertToHtml({ buffer });

//     if (!result.value || result.value.trim().length === 0) {
//       throw new Error("Document appears to be empty or unreadable");
//     }

//     return result.value;
//   }

//   /**
//    * Enhanced HTML parsing with better detection strategies
//    */
//   private static parseHtmlStructureEnhanced(html: string): ParsedStructure {
//     const acts: ParsedAct[] = [];
//     let currentAct: ParsedAct | null = null;
//     let currentChapter: ParsedChapter | null = null;
//     let currentSceneContent: string[] = [];

//     let actOrder = 1;
//     let chapterOrder = 1;
//     let sceneOrder = 1;

//     // NEW: Track original chapter titles for duplicate detection
//     const originalChapterTitles: string[] = [];

//     // Better line splitting
//     const lines = html
//       .split(/(?=<[h1h2h3hr]|<p)/i)
//       .filter((line) => line.trim());

//     console.log("🔍 Parsing lines:", lines.length);

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];
//       const textContent = line.replace(/<[^>]*>/g, "").trim();

//       // Debug logging
//       if (textContent.toLowerCase().includes("act") || line.match(/^<h[12]/i)) {
//         console.log("🔍 Checking line:", {
//           line: line.substring(0, 100),
//           textContent,
//         });
//       }

//       // Enhanced Act Detection
//       if (this.isActLine(line, textContent)) {
//         console.log("✅ Detected ACT:", textContent);
//         this.saveCurrentScene(
//           currentChapter,
//           currentSceneContent,
//           sceneOrder++
//         );
//         currentSceneContent = [];

//         const actTitle = this.extractActTitle(textContent);
//         currentAct = {
//           title: actTitle,
//           order: actOrder++,
//           chapters: [],
//         };
//         acts.push(currentAct);

//         chapterOrder = 1;
//         sceneOrder = 1;
//         currentChapter = null;
//         continue;
//       }

//       // Enhanced Chapter Detection
//       if (this.isChapterLine(line, textContent)) {
//         console.log("✅ Detected CHAPTER:", textContent);

//         // NEW: Store original title for duplicate detection
//         originalChapterTitles.push(textContent);

//         this.saveCurrentScene(
//           currentChapter,
//           currentSceneContent,
//           sceneOrder++
//         );
//         currentSceneContent = [];

//         if (!currentAct) {
//           currentAct = this.createDefaultAct(actOrder++);
//           acts.push(currentAct);
//         }

//         const chapterTitle = this.extractChapterTitle(textContent);
//         currentChapter = {
//           title: chapterTitle,
//           order: chapterOrder++,
//           scenes: [],
//         };
//         currentAct.chapters.push(currentChapter);
//         sceneOrder = 1;
//         continue;
//       }

//       // Enhanced Scene Break Detection
//       if (this.isSceneBreak(line, textContent)) {
//         if (currentSceneContent.length > 0 && currentChapter) {
//           this.saveCurrentScene(
//             currentChapter,
//             currentSceneContent,
//             sceneOrder++
//           );
//           currentSceneContent = [];
//         }
//         continue;
//       }

//       // Content accumulation
//       if (textContent && !this.isSceneBreak(line, textContent)) {
//         // Create default structure if needed
//         if (!currentAct) {
//           currentAct = this.createDefaultAct(actOrder++);
//           acts.push(currentAct);
//         }

//         if (!currentChapter) {
//           currentChapter = this.createDefaultChapter(chapterOrder++);
//           currentAct.chapters.push(currentChapter);
//         }

//         currentSceneContent.push(line);
//       }
//     }

//     // Save final scene
//     if (currentSceneContent.length > 0 && currentChapter) {
//       this.saveCurrentScene(currentChapter, currentSceneContent, sceneOrder);
//     }

//     console.log("📊 Final structure:", {
//       acts: acts.map((a) => ({ title: a.title, chapters: a.chapters.length })),
//     });

//     // NEW: Store original titles for issue detection
//     const structureWithOriginals = {
//       acts,
//       wordCount: this.calculateTotalWordCount(acts),
//       _originalChapterTitles: originalChapterTitles, // Hidden field for issue detection
//     };

//     return structureWithOriginals;
//   }

//   /**
//    * Enhanced act detection with multiple strategies
//    */
//   private static isActLine(line: string, textContent: string): boolean {
//     // Only detect acts if they are VERY clearly acts

//     // Strategy 1: H1 headings that contain "ACT" keyword
//     if (
//       line.match(/^<h1[^>]*>/i) &&
//       textContent.match(/^(act|book|part|volume)\s+/i)
//     ) {
//       return true;
//     }

//     // Strategy 2: H1 headings with roman numerals at the start
//     if (
//       line.match(/^<h1[^>]*>/i) &&
//       textContent.match(/^(I|II|III|IV|V|VI|VII|VIII|IX|X)[:\.\s]/i)
//     ) {
//       return true;
//     }

//     // No other detection - be very conservative
//     return false;
//   }

//   /**
//    * Enhanced chapter detection with multiple strategies
//    */
//   private static isChapterLine(line: string, textContent: string): boolean {
//     // Strategy 1: H2 headings
//     if (line.match(/^<h2[^>]*>/i) && textContent.trim()) {
//       return true;
//     }

//     // Strategy 2: "Chapter" keyword with number (must be at start of paragraph/heading)
//     if (
//       line.match(/^<(h[2-4]|p)[^>]*>/i) &&
//       textContent.match(/^chapter\s+(\d+|[ivx]+)[\s\-\—\:]*(.*)$/i)
//     ) {
//       return true;
//     }

//     // Strategy 3: Standalone numbers only if they're in headings and short
//     if (
//       line.match(/^<h[2-4][^>]*>/i) &&
//       textContent.match(/^\s*(\d+)\s*\.?\s*$/) &&
//       textContent.length < 10
//     ) {
//       return true;
//     }

//     return false;
//   }

//   /**
//    * Enhanced scene break detection
//    */
//   private static isSceneBreak(line: string, textContent: string): boolean {
//     // HR tags
//     if (line.match(/^<hr[^>]*>/i)) return true;

//     // Common scene break markers
//     const breakMarkers = ["***", "---", "* * *", "- - -", "~~~"];
//     if (breakMarkers.includes(textContent.trim())) return true;

//     return false;
//   }

//   /**
//    * Extract and clean act title
//    */
//   private static extractActTitle(textContent: string): string {
//     // If it has "Act" keyword, use as-is
//     if (textContent.match(/^(act|book|part|volume)/i)) {
//       return textContent;
//     }

//     // If it's a roman numeral, format nicely
//     const romanMatch = textContent.match(
//       /^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.?\s*(.+)?$/i
//     );
//     if (romanMatch) {
//       const subtitle = romanMatch[2] ? `: ${romanMatch[2].trim()}` : "";
//       return `Act ${romanMatch[1]}${subtitle}`;
//     }

//     // Otherwise use as-is
//     return textContent || "Untitled Act";
//   }

//   /**
//    * Extract and clean chapter title
//    */
//   private static extractChapterTitle(textContent: string): string {
//     // If it has "Chapter" keyword, use as-is
//     const chapterMatch = textContent.match(
//       /^chapter\s+(\d+|[ivx]+)[\s\-\—\:]*(.*)$/i
//     );
//     if (chapterMatch) {
//       const subtitle = chapterMatch[2] ? `: ${chapterMatch[2].trim()}` : "";
//       return `Chapter ${chapterMatch[1]}${subtitle}`;
//     }

//     // If it's just a number, format as chapter
//     const numberMatch = textContent.match(/^\s*(\d+)\s*\.?\s*$/);
//     if (numberMatch) {
//       return `Chapter ${numberMatch[1]}`;
//     }

//     // Otherwise use as-is
//     return textContent || "Untitled Chapter";
//   }

//   // Helper methods (same logic as before)
//   private static createDefaultAct(order: number): ParsedAct {
//     return {
//       title: `Act ${order}`,
//       order,
//       chapters: [],
//     };
//   }

//   private static createDefaultChapter(order: number): ParsedChapter {
//     return {
//       title: `Chapter ${order}`,
//       order,
//       scenes: [],
//     };
//   }

//   private static saveCurrentScene(
//     chapter: ParsedChapter | null,
//     content: string[],
//     order: number
//   ): void {
//     if (!chapter || content.length === 0) return;

//     const sceneHtml = content.join("");
//     const wordCount = this.countWords(sceneHtml);

//     chapter.scenes.push({
//       content: sceneHtml,
//       order,
//       wordCount,
//     });
//   }

//   private static countWords(html: string): number {
//     const text = html.replace(/<[^>]*>/g, " ").trim();
//     if (!text) return 0;
//     return text.split(/\s+/).filter((word) => word.length > 0).length;
//   }

//   private static calculateTotalWordCount(acts: ParsedAct[]): number {
//     return acts.reduce(
//       (total, act) =>
//         total +
//         act.chapters.reduce(
//           (actTotal, chapter) =>
//             actTotal +
//             chapter.scenes.reduce(
//               (chapterTotal, scene) => chapterTotal + scene.wordCount,
//               0
//             ),
//           0
//         ),
//       0
//     );
//   }

//   /**
//    * Validate parsed structure (enhanced with structured issue objects)
//    */
//   static validateStructure(structure: ParsedStructure): {
//     isValid: boolean;
//     errors: string[];
//     warnings: StructureIssue[];
//   } {
//     const errors: string[] = [];
//     const warnings = structure.issues || [];

//     if (structure.acts.length === 0) {
//       errors.push("No acts found in document");
//     }

//     structure.acts.forEach((act, actIndex) => {
//       if (!act.title.trim()) {
//         errors.push(`Act ${actIndex + 1} has no title`);
//       }

//       if (act.chapters.length === 0) {
//         errors.push(`Act "${act.title}" has no chapters`);
//       }

//       act.chapters.forEach((chapter, chapterIndex) => {
//         if (!chapter.title.trim()) {
//           errors.push(
//             `Chapter ${chapterIndex + 1} in Act "${act.title}" has no title`
//           );
//         }

//         if (chapter.scenes.length === 0) {
//           errors.push(`Chapter "${chapter.title}" has no scenes`);
//         }
//       });
//     });

//     return {
//       isValid: errors.length === 0,
//       errors,
//       warnings,
//     };
//   }

//   /**
//    * NEW: Analyze advanced issues with auto-fix suggestions
//    */
//   private static analyzeAdvancedIssues(
//     structure: ParsedStructure & { _originalChapterTitles?: string[] }
//   ): StructureIssue[] {
//     const issues: StructureIssue[] = [];

//     // NEW: Check original chapter titles first (before auto-numbering)
//     if (structure._originalChapterTitles) {
//       this.checkOriginalChapterTitlesAdvanced(
//         structure._originalChapterTitles,
//         issues
//       );
//     }

//     // Check each act
//     structure.acts.forEach((act, actIndex) => {
//       // Empty acts
//       if (act.chapters.length === 0) {
//         issues.push({
//           type: "empty_act",
//           severity: "warning",
//           message: `"${act.title}" contains no chapters`,
//           suggestion: "Add content or remove this act",
//           autoFixable: false,
//         });
//       }

//       act.chapters.forEach((chapter, chapterIndex) => {
//         // Empty chapters
//         if (chapter.scenes.length === 0) {
//           issues.push({
//             type: "empty_chapter",
//             severity: "warning",
//             message: `"${chapter.title}" contains no scenes`,
//             suggestion: "Add content or remove this chapter",
//             autoFixable: false,
//           });
//         }

//         // Check scenes
//         const veryShortScenes: number[] = [];
//         const veryLongScenes: number[] = [];

//         chapter.scenes.forEach((scene, sceneIndex) => {
//           // Very short scenes
//           if (scene.wordCount < 50 && scene.wordCount > 0) {
//             veryShortScenes.push(scene.order);
//           }

//           // Very long scenes
//           if (scene.wordCount > 5000) {
//             veryLongScenes.push(scene.order);
//           }

//           // Empty scenes
//           if (scene.wordCount === 0) {
//             issues.push({
//               type: "empty_scene",
//               severity: "warning",
//               message: `Scene ${scene.order} in "${chapter.title}" is empty`,
//               autoFixable: false,
//             });
//           }
//         });

//         // Group short scenes for combining suggestion
//         if (veryShortScenes.length > 1) {
//           issues.push({
//             type: "short_scenes",
//             severity: "info",
//             message: `Multiple short scenes in "${
//               chapter.title
//             }": ${veryShortScenes.join(", ")} (< 50 words each)`,
//             suggestion: "Consider combining these short scenes",
//             autoFixable: true,
//             fixAction: {
//               type: "combine_scenes",
//               description: `Combine scenes ${veryShortScenes.join(", ")} in "${
//                 chapter.title
//               }"`,
//               targetId: chapter.title,
//             },
//           });
//         } else if (veryShortScenes.length === 1) {
//           issues.push({
//             type: "short_scene",
//             severity: "info",
//             message: `Scene ${veryShortScenes[0]} in "${
//               chapter.title
//             }" is very short (${
//               chapter.scenes.find((s) => s.order === veryShortScenes[0])
//                 ?.wordCount
//             } words)`,
//             autoFixable: false,
//           });
//         }

//         // Long scenes for splitting suggestion
//         veryLongScenes.forEach((sceneOrder) => {
//           const scene = chapter.scenes.find((s) => s.order === sceneOrder);
//           issues.push({
//             type: "long_scene",
//             severity: "info",
//             message: `Scene ${sceneOrder} in "${chapter.title}" is very long (${scene?.wordCount} words)`,
//             suggestion: "Consider splitting this scene",
//             autoFixable: true,
//             fixAction: {
//               type: "split_scenes",
//               description: `Split scene ${sceneOrder} in "${chapter.title}"`,
//               targetId: `${chapter.title}-scene-${sceneOrder}`,
//             },
//           });
//         });
//       });
//     });

//     // Overall document issues
//     if (structure.wordCount < 1000) {
//       issues.push({
//         type: "short_document",
//         severity: "info",
//         message: `Document is quite short (${structure.wordCount} words)`,
//         suggestion: "Verify this is the complete manuscript",
//         autoFixable: false,
//       });
//     }

//     if (structure.wordCount > 200000) {
//       issues.push({
//         type: "long_document",
//         severity: "info",
//         message: `Document is very long (${structure.wordCount} words)`,
//         suggestion: "Consider splitting into multiple volumes",
//         autoFixable: false,
//       });
//     }

//     const totalScenes = structure.acts.reduce(
//       (sum, act) =>
//         sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
//       0
//     );

//     if (totalScenes < 3) {
//       issues.push({
//         type: "few_scenes",
//         severity: "warning",
//         message: `Only ${totalScenes} scenes detected`,
//         suggestion: "Add more scene breaks using *** or ---",
//         autoFixable: false,
//       });
//     }

//     const avgWordsPerScene =
//       totalScenes > 0 ? Math.round(structure.wordCount / totalScenes) : 0;
//     if (avgWordsPerScene < 100) {
//       issues.push({
//         type: "short_average_scenes",
//         severity: "info",
//         message: `Average scene length is quite short (${avgWordsPerScene} words)`,
//         suggestion: "Consider combining scenes",
//         autoFixable: true,
//         fixAction: {
//           type: "combine_scenes",
//           description:
//             "Auto-combine scenes under 100 words with adjacent scenes",
//         },
//       });
//     }

//     if (avgWordsPerScene > 3000) {
//       issues.push({
//         type: "long_average_scenes",
//         severity: "info",
//         message: `Average scene length is quite long (${avgWordsPerScene} words)`,
//         suggestion: "Consider adding more scene breaks",
//         autoFixable: false,
//       });
//     }

//     return issues;
//   }

//   /**
//    * NEW: Check original chapter titles with auto-fix suggestions
//    */
//   private static checkOriginalChapterTitlesAdvanced(
//     originalTitles: string[],
//     issues: StructureIssue[]
//   ): void {
//     if (!originalTitles || originalTitles.length <= 1) return;

//     // Extract chapter numbers from original titles
//     const chapterNumbers: number[] = [];
//     originalTitles.forEach((title) => {
//       const match = title.match(/chapter\s+(\d+)/i);
//       if (match) {
//         chapterNumbers.push(parseInt(match[1]));
//       }
//     });

//     if (chapterNumbers.length > 1) {
//       // Check for duplicates in original numbering
//       const duplicates = chapterNumbers.filter(
//         (num, index) => chapterNumbers.indexOf(num) !== index
//       );
//       if (duplicates.length > 0) {
//         issues.push({
//           type: "duplicate_chapter_numbers",
//           severity: "warning",
//           message: `Original document has duplicate chapter numbers: ${[
//             ...new Set(duplicates),
//           ].join(", ")}`,
//           suggestion: "Auto-fixed during import with sequential numbering",
//           autoFixable: true,
//           fixAction: {
//             type: "renumber_chapters",
//             description: "Renumber all chapters sequentially (1, 2, 3...)",
//           },
//         });
//       }

//       // Check for gaps in original numbering
//       const sortedNumbers = [...new Set(chapterNumbers)].sort((a, b) => a - b);
//       for (let i = 1; i < sortedNumbers.length; i++) {
//         if (sortedNumbers[i] - sortedNumbers[i - 1] > 1) {
//           issues.push({
//             type: "chapter_numbering_gaps",
//             severity: "warning",
//             message: `Original document has chapter numbering gaps: ${sortedNumbers.join(
//               ", "
//             )}`,
//             suggestion: "Auto-fixed during import with sequential numbering",
//             autoFixable: true,
//             fixAction: {
//               type: "renumber_chapters",
//               description: "Renumber all chapters to remove gaps",
//             },
//           });
//           break;
//         }
//       }
//     }

//     // Check for identical chapter titles (case-insensitive)
//     const lowerTitles = originalTitles.map((t) => t.toLowerCase());
//     const duplicateTitles = lowerTitles.filter(
//       (title, index) => lowerTitles.indexOf(title) !== index
//     );
//     if (duplicateTitles.length > 0) {
//       issues.push({
//         type: "duplicate_chapter_titles",
//         severity: "warning",
//         message: `Document has duplicate chapter titles`,
//         suggestion: "Auto-fixed during import by adding numbers to duplicates",
//         autoFixable: true,
//         fixAction: {
//           type: "rename_duplicate",
//           description: "Rename duplicate chapters with unique suffixes",
//         },
//       });
//     }
//   }

//   /**
//    * Check for act numbering issues
//    */
//   private static checkActNumbering(acts: ParsedAct[], issues: string[]): void {
//     if (acts.length <= 1) return;

//     const orders = acts.map((act) => act.order);
//     const expectedOrders = Array.from({ length: acts.length }, (_, i) => i + 1);

//     // Check for gaps
//     for (let i = 0; i < expectedOrders.length; i++) {
//       if (orders[i] !== expectedOrders[i]) {
//         issues.push(
//           `Act numbering has gaps or inconsistencies - found orders: ${orders.join(
//             ", "
//           )}`
//         );
//         break;
//       }
//     }

//     // Check for duplicates
//     const duplicates = orders.filter(
//       (order, index) => orders.indexOf(order) !== index
//     );
//     if (duplicates.length > 0) {
//       issues.push(
//         `Duplicate act numbers found: ${[...new Set(duplicates)].join(", ")}`
//       );
//     }

//     // Check for acts with very similar titles
//     for (let i = 0; i < acts.length; i++) {
//       for (let j = i + 1; j < acts.length; j++) {
//         const similarity = this.calculateSimilarity(
//           acts[i].title,
//           acts[j].title
//         );
//         if (similarity > 0.8 && acts[i].title !== acts[j].title) {
//           issues.push(
//             `Acts "${acts[i].title}" and "${acts[j].title}" have very similar titles`
//           );
//         }
//       }
//     }
//   }

//   /**
//    * Check for chapter numbering issues within an act
//    */
//   private static checkChapterNumbering(
//     chapters: ParsedChapter[],
//     actTitle: string,
//     issues: string[]
//   ): void {
//     if (chapters.length <= 1) return;

//     const orders = chapters.map((ch) => ch.order);
//     const expectedOrders = Array.from(
//       { length: chapters.length },
//       (_, i) => i + 1
//     );

//     // Check for gaps
//     for (let i = 0; i < expectedOrders.length; i++) {
//       if (orders[i] !== expectedOrders[i]) {
//         issues.push(
//           `Chapter numbering in "${actTitle}" has gaps - found orders: ${orders.join(
//             ", "
//           )}`
//         );
//         break;
//       }
//     }

//     // Check for duplicates
//     const duplicates = orders.filter(
//       (order, index) => orders.indexOf(order) !== index
//     );
//     if (duplicates.length > 0) {
//       issues.push(
//         `Duplicate chapter numbers in "${actTitle}": ${[
//           ...new Set(duplicates),
//         ].join(", ")}`
//       );
//     }

//     // Check for chapters with identical titles
//     const titles = chapters.map((ch) => ch.title.toLowerCase());
//     const duplicateTitles = titles.filter(
//       (title, index) => titles.indexOf(title) !== index
//     );
//     if (duplicateTitles.length > 0) {
//       issues.push(
//         `Duplicate chapter titles in "${actTitle}": ${[
//           ...new Set(duplicateTitles),
//         ].join(", ")}`
//       );
//     }
//   }

//   /**
//    * NEW: Check original chapter titles for duplicates before auto-numbering
//    */
//   private static checkOriginalChapterTitles(
//     originalTitles: string[],
//     issues: string[]
//   ): void {
//     if (!originalTitles || originalTitles.length <= 1) return;

//     // Extract chapter numbers from original titles
//     const chapterNumbers: number[] = [];
//     originalTitles.forEach((title) => {
//       const match = title.match(/chapter\s+(\d+)/i);
//       if (match) {
//         chapterNumbers.push(parseInt(match[1]));
//       }
//     });

//     if (chapterNumbers.length > 1) {
//       // Check for duplicates in original numbering
//       const duplicates = chapterNumbers.filter(
//         (num, index) => chapterNumbers.indexOf(num) !== index
//       );
//       if (duplicates.length > 0) {
//         issues.push(
//           `Original document has duplicate chapter numbers: ${[
//             ...new Set(duplicates),
//           ].join(", ")} (auto-fixed during import)`
//         );
//       }

//       // Check for gaps in original numbering
//       const sortedNumbers = [...new Set(chapterNumbers)].sort((a, b) => a - b);
//       for (let i = 1; i < sortedNumbers.length; i++) {
//         if (sortedNumbers[i] - sortedNumbers[i - 1] > 1) {
//           issues.push(
//             `Original document has chapter numbering gaps: ${sortedNumbers.join(
//               ", "
//             )} (auto-fixed during import)`
//           );
//           break;
//         }
//       }
//     }

//     // Check for identical chapter titles (case-insensitive)
//     const lowerTitles = originalTitles.map((t) => t.toLowerCase());
//     const duplicateTitles = lowerTitles.filter(
//       (title, index) => lowerTitles.indexOf(title) !== index
//     );
//     if (duplicateTitles.length > 0) {
//       issues.push(
//         `Document has duplicate chapter titles: "${[
//           ...new Set(duplicateTitles),
//         ].join('", "')}" (auto-fixed during import)`
//       );
//     }
//   }

//   /**
//    * Check for scene numbering issues within a chapter
//    */
//   private static checkSceneNumbering(
//     scenes: ParsedScene[],
//     chapterTitle: string,
//     issues: string[]
//   ): void {
//     if (scenes.length <= 1) return;

//     const orders = scenes.map((scene) => scene.order);
//     const expectedOrders = Array.from(
//       { length: scenes.length },
//       (_, i) => i + 1
//     );

//     // Check for gaps
//     for (let i = 0; i < expectedOrders.length; i++) {
//       if (orders[i] !== expectedOrders[i]) {
//         issues.push(
//           `Scene numbering in "${chapterTitle}" has gaps - found orders: ${orders.join(
//             ", "
//           )}`
//         );
//         break;
//       }
//     }

//     // Check for duplicates
//     const duplicates = orders.filter(
//       (order, index) => orders.indexOf(order) !== index
//     );
//     if (duplicates.length > 0) {
//       issues.push(
//         `Duplicate scene numbers in "${chapterTitle}": ${[
//           ...new Set(duplicates),
//         ].join(", ")}`
//       );
//     }
//   }

//   /**
//    * Check for overall structure consistency issues
//    */
//   private static checkStructureConsistency(
//     structure: ParsedStructure,
//     issues: string[]
//   ): void {
//     const actChapterCounts = structure.acts.map((act) => act.chapters.length);
//     const minChapters = Math.min(...actChapterCounts);
//     const maxChapters = Math.max(...actChapterCounts);

//     // Check for very uneven act sizes
//     if (maxChapters > minChapters * 3 && structure.acts.length > 1) {
//       issues.push(
//         `Act sizes are very uneven (${minChapters}-${maxChapters} chapters) - consider rebalancing`
//       );
//     }

//     // Check for acts with only one chapter
//     const singleChapterActs = structure.acts.filter(
//       (act) => act.chapters.length === 1
//     );
//     if (singleChapterActs.length > 0 && structure.acts.length > 1) {
//       const actNames = singleChapterActs
//         .map((act) => `"${act.title}"`)
//         .join(", ");
//       issues.push(
//         `Some acts have only one chapter (${actNames}) - consider combining with adjacent acts`
//       );
//     }

//     // Check for chapters with very different scene counts
//     const allChapters = structure.acts.flatMap((act) => act.chapters);
//     const sceneCounts = allChapters.map((ch) => ch.scenes.length);
//     const minScenes = Math.min(...sceneCounts);
//     const maxScenes = Math.max(...sceneCounts);

//     if (maxScenes > minScenes * 5 && allChapters.length > 2) {
//       issues.push(
//         `Chapter sizes vary greatly (${minScenes}-${maxScenes} scenes) - consider more consistent pacing`
//       );
//     }

//     // Check for missing titles (generic auto-generated ones)
//     const genericActTitles = structure.acts.filter(
//       (act) => act.title.match(/^Act \d+$/i) || act.title === "Untitled Act"
//     );
//     if (genericActTitles.length > 0) {
//       issues.push(
//         `${genericActTitles.length} acts have generic titles - consider adding descriptive titles`
//       );
//     }

//     const genericChapterTitles = allChapters.filter(
//       (ch) =>
//         ch.title.match(/^Chapter \d+$/i) || ch.title === "Untitled Chapter"
//     );
//     if (genericChapterTitles.length > allChapters.length * 0.5) {
//       issues.push(
//         `Many chapters have generic titles - consider adding descriptive titles`
//       );
//     }
//   }

//   /**
//    * Calculate text similarity (simple version)
//    */
//   private static calculateSimilarity(str1: string, str2: string): number {
//     const a = str1.toLowerCase().trim();
//     const b = str2.toLowerCase().trim();

//     if (a === b) return 1;
//     if (a.length === 0 || b.length === 0) return 0;

//     // Simple word-based similarity
//     const wordsA = a.split(/\s+/);
//     const wordsB = b.split(/\s+/);
//     const commonWords = wordsA.filter((word) => wordsB.includes(word));

//     return commonWords.length / Math.max(wordsA.length, wordsB.length);
//   }
// }
