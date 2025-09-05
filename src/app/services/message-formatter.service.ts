import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class MessageFormatterService {

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Converts basic markdown to HTML for message display
   */
  formatMessage(content: string): SafeHtml {
    let formatted = content;

    // Convert bullet points (* item) to HTML lists
    formatted = this.convertBulletPoints(formatted);

    // Convert numbered lists (1. item) to HTML ordered lists
    formatted = this.convertNumberedLists(formatted);

    // Convert **bold** to <strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert `code` to <code>
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

    // Convert ```code blocks``` to <pre><code>
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Convert line breaks to <br>
    // formatted = formatted.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(formatted);
  }

  private convertBulletPoints(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('* ') || line.startsWith('- ')) {
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        const content = line.substring(2).trim();
        result.push(`<li>${content}</li>`);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        result.push(line);
      }
    }

    // Close list if we end with one
    if (inList) {
      result.push('</ul>');
    }

    return result.join('\n');
  }

  private convertNumberedLists(text: string): string {
    const lines = text.split('\n');
    let result: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for numbered list pattern (1. item, 2. item, etc.)
      if (/^\d+\.\s/.test(line)) {
        if (!inList) {
          result.push('<ol>');
          inList = true;
        }
        const content = line.replace(/^\d+\.\s/, '');
        result.push(`<li>${content}</li>`);
      } else {
        if (inList) {
          result.push('</ol>');
          inList = false;
        }
        result.push(line);
      }
    }

    // Close list if we end with one
    if (inList) {
      result.push('</ol>');
    }

    return result.join('\n');
  }
}
