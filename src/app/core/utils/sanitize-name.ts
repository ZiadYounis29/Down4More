export function sanitizeName(text: string): string {
  return text
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150)
    .trim();
}
