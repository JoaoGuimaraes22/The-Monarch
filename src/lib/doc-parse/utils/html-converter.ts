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
}
