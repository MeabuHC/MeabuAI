/**
 * Text utility functions for cleaning and formatting text
 */

/**
 * Cleans up multiple consecutive empty lines in text
 * Reduces 3+ consecutive newlines to just 2 (one empty line)
 * @param text - The text to clean up
 * @returns Cleaned text with normalized line breaks
 */
export const cleanupText = (text: string): string => {
    // Replace multiple consecutive newlines with just one empty line
    return text.replace(/\n\s*\n\s*\n+/g, "\n\n");
};
