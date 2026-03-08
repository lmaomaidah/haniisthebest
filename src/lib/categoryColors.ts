/**
 * Deterministic color mapping for categories.
 * Uses the retro rainbow palette from the design system.
 */

const CATEGORY_COLORS = [
  { bg: "hsl(340 85% 62% / 0.2)", border: "hsl(340 85% 62% / 0.5)", text: "hsl(340 85% 72%)", dot: "hsl(340 85% 62%)" },   // neon-pink
  { bg: "hsl(225 80% 58% / 0.2)", border: "hsl(225 80% 58% / 0.5)", text: "hsl(225 80% 72%)", dot: "hsl(225 80% 58%)" },   // electric-blue
  { bg: "hsl(145 65% 48% / 0.2)", border: "hsl(145 65% 48% / 0.5)", text: "hsl(145 65% 62%)", dot: "hsl(145 65% 48%)" },   // lime-green
  { bg: "hsl(45 100% 58% / 0.2)", border: "hsl(45 100% 58% / 0.5)", text: "hsl(45 100% 68%)", dot: "hsl(45 100% 58%)" },   // sunshine-yellow
  { bg: "hsl(275 75% 58% / 0.2)", border: "hsl(275 75% 58% / 0.5)", text: "hsl(275 75% 72%)", dot: "hsl(275 75% 58%)" },   // hot-purple
  { bg: "hsl(12 90% 68% / 0.2)", border: "hsl(12 90% 68% / 0.5)", text: "hsl(12 90% 78%)", dot: "hsl(12 90% 68%)" },       // coral
  { bg: "hsl(200 85% 62% / 0.2)", border: "hsl(200 85% 62% / 0.5)", text: "hsl(200 85% 72%)", dot: "hsl(200 85% 62%)" },   // sky-blue
  { bg: "hsl(25 95% 58% / 0.2)", border: "hsl(25 95% 58% / 0.5)", text: "hsl(25 95% 68%)", dot: "hsl(25 95% 58%)" },       // tangerine
  { bg: "hsl(280 60% 72% / 0.2)", border: "hsl(280 60% 72% / 0.5)", text: "hsl(280 60% 82%)", dot: "hsl(280 60% 72%)" },   // lavender
  { bg: "hsl(330 70% 75% / 0.2)", border: "hsl(330 70% 75% / 0.5)", text: "hsl(330 70% 82%)", dot: "hsl(330 70% 75%)" },   // cloud-pink
] as const;

/** Get a stable color for a category based on its ID */
export function getCategoryColor(categoryId: string) {
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = ((hash << 5) - hash + categoryId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[index];
}

/** Get inline styles for a category badge */
export function getCategoryBadgeStyle(categoryId: string, isSelected: boolean = false) {
  const color = getCategoryColor(categoryId);
  return {
    backgroundColor: isSelected ? color.dot : color.bg,
    borderColor: color.border,
    color: isSelected ? "hsl(25 15% 10%)" : color.text,
  };
}
