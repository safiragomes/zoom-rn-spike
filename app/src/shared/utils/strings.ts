/** Framework-free string helpers. */

/**
 * Cuts `value` down to `maxLength` characters, keeping whole words and adding
 * an ellipsis. Returns the original string when it already fits.
 */
export function truncate(value: string, maxLength: number): string {
  if (maxLength <= 0) return "";
  if (value.length <= maxLength) return value;

  const cut = value.slice(0, maxLength);

  // The cut landed exactly at a word boundary: nothing to discard.
  if (value[maxLength] === " ") return `${cut}…`;

  const lastSpace = cut.lastIndexOf(" ");

  // No space in the slice: it is a single word, so cut at the limit.
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
}

/** Initials of a name, capped at `count` letters. Handy for avatars. */
export function initials(fullName: string, count = 2): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, count)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
