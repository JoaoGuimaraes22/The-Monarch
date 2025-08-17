// src/lib/doc-parse/utils/html-converter.ts
// HTML conversion utilities using mammoth

import * as mammoth from "mammoth";

export class HtmlConverter {
  /**
   * Convert .docx File to HTML
   */
  static async convertFileToHtml(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await mammoth.convertToHtml({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("Document appears to be empty or unreadable");
    }

    return result.value;
  }

  /**
   * Convert ArrayBuffer to HTML
   */
  static async convertBufferToHtml(buffer: ArrayBuffer): Promise<string> {
    // Convert ArrayBuffer to Node.js Buffer for mammoth
    const nodeBuffer = Buffer.from(buffer);

    const result = await mammoth.convertToHtml({ buffer: nodeBuffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("Document appears to be empty or unreadable");
    }

    return result.value;
  }

  /**
   * Convert Buffer (Node.js) to HTML - for server-side usage
   */
  static async convertNodeBufferToHtml(buffer: Buffer): Promise<string> {
    const result = await mammoth.convertToHtml({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("Document appears to be empty or unreadable");
    }

    return result.value;
  }

  /**
   * Split HTML into processable lines
   */
  static splitHtmlIntoLines(html: string): string[] {
    return html.split(/(?=<[h1h2h3hr]|<p)/i).filter((line) => line.trim());
  }

  /**
   * Extract text content from HTML line
   */
  static extractTextContent(htmlLine: string): string {
    return htmlLine.replace(/<[^>]*>/g, "").trim();
  }

  /**
   * Count words in HTML content
   */
  static countWordsInHtml(html: string): number {
    const text = html.replace(/<[^>]*>/g, " ").trim();
    if (!text) return 0;
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Validate that content is not empty
   */
  static validateHtmlContent(html: string): void {
    if (!html || html.trim().length === 0) {
      throw new Error("Document appears to be empty or unreadable");
    }

    const textContent = this.extractTextContent(html);
    if (!textContent || textContent.length === 0) {
      throw new Error("Document contains no readable text content");
    }
  }

  /**
   * Get document metadata from mammoth conversion
   */
  static async getDocumentInfo(file: File): Promise<{
    size: number;
    type: string;
    wordCount: number;
    isEmpty: boolean;
  }> {
    try {
      const html = await this.convertFileToHtml(file);
      const wordCount = this.countWordsInHtml(html);

      return {
        size: file.size,
        type: file.type,
        wordCount,
        isEmpty: wordCount === 0,
      };
    } catch (error) {
      throw new Error(
        `Failed to analyze document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
