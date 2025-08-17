import * as mammoth from "mammoth";

export interface ParsedStructure {
  acts: ParsedAct[];
  wordCount: number;
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

export class DocxParser {
  /**
   * Parse a .docx file and extract Act/Chapter/Scene structure
   */
  static async parseDocx(file: File): Promise<ParsedStructure> {
    try {
      // Convert .docx to HTML using mammoth
      const arrayBuffer = await file.arrayBuffer();

      console.log("Array buffer size:", arrayBuffer.byteLength);

      // Try using Buffer for Node.js environment
      const buffer = Buffer.from(arrayBuffer);

      console.log("Buffer created, size:", buffer.length);

      // Use mammoth with buffer instead of arrayBuffer
      const result = await mammoth.convertToHtml({
        buffer: buffer,
      });

      console.log("Mammoth conversion successful");

      const html = result.value;

      if (!html || html.trim().length === 0) {
        throw new Error("Document appears to be empty or unreadable");
      }

      console.log("HTML length:", html.length);
      console.log("HTML preview:", html.substring(0, 500));

      // Parse the HTML structure
      return this.parseHtmlStructure(html);
    } catch (error) {
      console.error("Error parsing docx file:", error);

      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Could not find file")) {
          throw new Error(
            "Invalid .docx file format. Please ensure the file is not corrupted."
          );
        }
        if (
          error.message.includes("buffer") ||
          error.message.includes("arrayBuffer")
        ) {
          throw new Error(
            "Failed to read file content. Please try uploading the file again."
          );
        }
      }

      throw new Error(
        "Failed to parse document. Please ensure it's a valid .docx file."
      );
    }
  }

  /**
   * Parse HTML content and extract structure based on headings and separators
   */
  private static parseHtmlStructure(html: string): ParsedStructure {
    // Use simple regex parsing instead of DOMParser for Node.js environment
    const acts: ParsedAct[] = [];
    let currentAct: ParsedAct | null = null;
    let currentChapter: ParsedChapter | null = null;
    let currentSceneContent: string[] = [];

    let actOrder = 1;
    let chapterOrder = 1;
    let sceneOrder = 1;

    // Split HTML into sections by tags and content
    const lines = html
      .split(/(?=<[h1h2]|<p|<hr)/i)
      .filter((line) => line.trim());

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Extract text content from HTML tags
      const textContent = trimmedLine.replace(/<[^>]*>/g, "").trim();

      // H1 = New Act
      if (trimmedLine.match(/^<h1[^>]*>/i) && textContent) {
        // Save current scene if exists
        if (currentSceneContent.length > 0 && currentChapter) {
          this.saveCurrentScene(
            currentChapter,
            currentSceneContent,
            sceneOrder++
          );
          currentSceneContent = [];
        }

        // Create new act
        currentAct = {
          title: textContent,
          order: actOrder++,
          chapters: [],
        };
        acts.push(currentAct);

        // Reset chapter and scene counters for new act
        chapterOrder = 1;
        sceneOrder = 1;
        currentChapter = null;
      }

      // H2 = New Chapter
      else if (trimmedLine.match(/^<h2[^>]*>/i) && textContent) {
        // Save current scene if exists
        if (currentSceneContent.length > 0 && currentChapter) {
          this.saveCurrentScene(
            currentChapter,
            currentSceneContent,
            sceneOrder++
          );
          currentSceneContent = [];
        }

        // Create new chapter (or default act if none exists)
        if (!currentAct) {
          currentAct = {
            title: "Act I",
            order: actOrder++,
            chapters: [],
          };
          acts.push(currentAct);
        }

        currentChapter = {
          title: textContent,
          order: chapterOrder++,
          scenes: [],
        };
        currentAct.chapters.push(currentChapter);
        sceneOrder = 1; // Reset scene order for new chapter
      }

      // HR or *** or --- = Scene break
      else if (this.isSceneBreakLine(trimmedLine, textContent)) {
        if (currentSceneContent.length > 0 && currentChapter) {
          this.saveCurrentScene(
            currentChapter,
            currentSceneContent,
            sceneOrder++
          );
          currentSceneContent = [];
        }
      }

      // Regular content
      else if (
        textContent &&
        !this.isSceneBreakLine(trimmedLine, textContent)
      ) {
        // Create default structure if none exists
        if (!currentAct) {
          currentAct = {
            title: "Act I",
            order: actOrder++,
            chapters: [],
          };
          acts.push(currentAct);
        }

        if (!currentChapter) {
          currentChapter = {
            title: "Chapter 1",
            order: chapterOrder++,
            scenes: [],
          };
          currentAct.chapters.push(currentChapter);
        }

        // Add content to current scene
        currentSceneContent.push(trimmedLine);
      }
    }

    // Save the last scene
    if (currentSceneContent.length > 0 && currentChapter) {
      this.saveCurrentScene(currentChapter, currentSceneContent, sceneOrder);
    }

    // Calculate total word count
    const wordCount = this.calculateTotalWordCount(acts);

    console.log("Parsed structure:", {
      acts: acts.length,
      chapters: acts.reduce((sum, act) => sum + act.chapters.length, 0),
      scenes: acts.reduce(
        (sum, act) =>
          sum + act.chapters.reduce((chSum, ch) => chSum + ch.scenes.length, 0),
        0
      ),
      wordCount,
    });

    return { acts, wordCount };
  }

  /**
   * Check if a line represents a scene break
   */
  private static isSceneBreakLine(
    htmlLine: string,
    textContent: string
  ): boolean {
    // HR tag
    if (htmlLine.match(/^<hr[^>]*>/i)) return true;

    // Text that's just *** or ---
    if (textContent === "***" || textContent === "---") return true;

    // Paragraph with only *** or ---
    if (
      htmlLine.match(/^<p[^>]*>/i) &&
      (textContent === "***" || textContent === "---")
    )
      return true;

    return false;
  }

  /**
   * Save accumulated content as a scene
   */
  private static saveCurrentScene(
    chapter: ParsedChapter,
    content: string[],
    order: number
  ): void {
    if (content.length === 0) return;

    const sceneHtml = content.join("");
    const wordCount = this.countWords(sceneHtml);

    chapter.scenes.push({
      content: sceneHtml,
      order,
      wordCount,
    });
  }

  /**
   * Count words in HTML content
   */
  private static countWords(html: string): number {
    // Strip HTML tags and count words
    const text = html.replace(/<[^>]*>/g, " ").trim();
    if (!text) return 0;

    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Calculate total word count across all acts
   */
  private static calculateTotalWordCount(acts: ParsedAct[]): number {
    return acts.reduce((total, act) => {
      return (
        total +
        act.chapters.reduce((actTotal, chapter) => {
          return (
            actTotal +
            chapter.scenes.reduce((chapterTotal, scene) => {
              return chapterTotal + scene.wordCount;
            }, 0)
          );
        }, 0)
      );
    }, 0);
  }

  /**
   * Validate that the parsed structure makes sense
   */
  static validateStructure(structure: ParsedStructure): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (structure.acts.length === 0) {
      errors.push("No acts found in document");
    }

    structure.acts.forEach((act, actIndex) => {
      if (!act.title.trim()) {
        errors.push(`Act ${actIndex + 1} has no title`);
      }

      if (act.chapters.length === 0) {
        errors.push(`Act "${act.title}" has no chapters`);
      }

      act.chapters.forEach((chapter, chapterIndex) => {
        if (!chapter.title.trim()) {
          errors.push(
            `Chapter ${chapterIndex + 1} in Act "${act.title}" has no title`
          );
        }

        if (chapter.scenes.length === 0) {
          errors.push(`Chapter "${chapter.title}" has no scenes`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
