// Merge class names. Handy when composing Tailwind utilities.
export function cn(
  ...parts: Array<string | undefined | null | false>
): string {
  return parts.filter(Boolean).join(" ");
}
