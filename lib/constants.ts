export const ALLOWED_STYLES = [
  "streetwear",
  "minimalist",
  "vintage",
  "gorpcore",
  "casual",
  "y2k",
  "workwear",
  "preppy",
  "chic",
  "sporty",
  "grunge",
  "boho",
  "old-money",
  "athleisure",
  "business-casual",
  "techwear",
  "retro",
  "cyberpunk",
  "dapper",
  "goth"
] as const;

export type StyleTag = typeof ALLOWED_STYLES[number];

const SYNONYM_MAP: Record<string, StyleTag> = {
  "street": "streetwear",
  "streetstyle": "streetwear",
  "minimal": "minimalist",
  "clean": "minimalist",
  "thrifted": "vintage",
  "activewear": "athleisure",
  "formal": "business-casual",
  "y2kfashion": "y2k",
};

export const MAX_HASHTAGS_PER_POST = 3;

export function normalizeTag(tag: string): StyleTag | null {
  const clean = tag.toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (ALLOWED_STYLES.includes(clean as StyleTag)) return clean as StyleTag;
  if (SYNONYM_MAP[clean]) return SYNONYM_MAP[clean];
  return null;
}
