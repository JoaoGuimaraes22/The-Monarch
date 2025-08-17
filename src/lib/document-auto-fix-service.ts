// // src/lib/document-auto-fix-service.ts
// // Step 1: Simple auto-fix service starting with chapter renumbering

// import {
//   ParsedStructure,
//   StructureIssue,
//   EnhancedDocxParser,
// } from "./enhanced-docx-parser";

// export interface AutoFixResult {
//   success: boolean;
//   message: string;
//   fixedStructure?: ParsedStructure;
//   error?: string;
// }

// export class DocumentAutoFixService {
//   /**
//    * Parse document from ArrayBuffer (for client-side auto-fix)
//    */
//   static async parseFromBuffer(buffer: ArrayBuffer): Promise<ParsedStructure> {
//     return EnhancedDocxParser.parseFromBuffer(buffer);
//   }

//   /**
//    * Apply a specific auto-fix to a document structure
//    */
//   static async applyAutoFix(
//     originalStructure: ParsedStructure,
//     issue: StructureIssue
//   ): Promise<AutoFixResult> {
//     try {
//       console.log("🔧 Applying auto-fix:", issue.type, issue.fixAction?.type);

//       switch (issue.fixAction?.type) {
//         case "renumber_chapters":
//           return this.renumberChapters(originalStructure);

//         default:
//           return {
//             success: false,
//             message: `Auto-fix type "${issue.fixAction?.type}" is not implemented yet`,
//             error: "Unsupported fix type",
//           };
//       }
//     } catch (error) {
//       console.error("❌ Auto-fix failed:", error);
//       return {
//         success: false,
//         message: "Auto-fix failed due to an unexpected error",
//         error: error instanceof Error ? error.message : "Unknown error",
//       };
//     }
//   }

//   /**
//    * Renumber all chapters sequentially within each act
//    */
//   private static renumberChapters(structure: ParsedStructure): AutoFixResult {
//     try {
//       // Deep clone the structure to avoid mutating the original
//       const fixedStructure = JSON.parse(
//         JSON.stringify(structure)
//       ) as ParsedStructure;
//       let totalRenamed = 0;

//       // Renumber chapters in each act
//       fixedStructure.acts.forEach((act) => {
//         act.chapters.forEach((chapter, index) => {
//           const newOrder = index + 1;
//           const oldOrder = chapter.order;

//           // Update the order
//           chapter.order = newOrder;

//           // Update the title if it contains "Chapter X"
//           const titleMatch = chapter.title.match(
//             /^(chapter\s+)(\d+|[ivx]+)(.*)$/i
//           );
//           if (titleMatch) {
//             const newTitle = `${titleMatch[1]}${newOrder}${
//               titleMatch[3] || ""
//             }`;
//             console.log(`📝 Renaming: "${chapter.title}" → "${newTitle}"`);
//             chapter.title = newTitle;
//             totalRenamed++;
//           } else if (oldOrder !== newOrder) {
//             // Order changed but title doesn't have "Chapter X" format
//             totalRenamed++;
//           }
//         });
//       });

//       return {
//         success: true,
//         message: `Successfully renumbered ${totalRenamed} chapters sequentially`,
//         fixedStructure,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: "Failed to renumber chapters",
//         error: error instanceof Error ? error.message : "Unknown error",
//       };
//     }
//   }
// }
