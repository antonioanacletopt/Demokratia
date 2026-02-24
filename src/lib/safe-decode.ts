/**
 * @fileOverview Utility for safe URI decoding to prevent "URI malformed" errors.
 */

export function safeDecode(str: string | null | undefined): string {
  if (!str) return '';
  try {
    // Attempt to decode normally, replacing + with spaces first
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch (e) {
    // If decoding fails (malformed URI), return the string with spaces but without decoding
    return str.replace(/\+/g, ' ');
  }
}
