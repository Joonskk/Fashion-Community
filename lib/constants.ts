// -----------------------------------------------------------------------------
// Styles (20 tags)
// -----------------------------------------------------------------------------
export const ALLOWED_STYLES = [
  "minimalist",
  "streetwear",
  "casual",
  "vintage",
  "gorpcore",
  "y2k",
  "preppy",
  "chic",
  "sporty",
  "grunge",
  "athleisure",
  "workwear",
  "boho",
  "business-casual",
  "academia",
  "techwear",
  "coquette",
  "retro",
  "normcore",
  "old-money",
] as const;

export type StyleTag = (typeof ALLOWED_STYLES)[number];

// -----------------------------------------------------------------------------
// Items (20 tags)
// -----------------------------------------------------------------------------
export const ALLOWED_ITEMS = [
  "t-shirt",
  "shirt",
  "hoodie",
  "sweatshirt",
  "sweater",
  "jacket",
  "coat",
  "blazer",
  "jeans",
  "trousers",
  "sweatpants",
  "shorts",
  "skirt",
  "dress",
  "sneakers",
  "boots",
  "loafers",
  "cap",
  "beanie",
  "bag",
] as const;

export type ItemCategory = (typeof ALLOWED_ITEMS)[number];

// -----------------------------------------------------------------------------
// Seasons (5 tags)
// -----------------------------------------------------------------------------
export const ALLOWED_SEASONS = [
  "spring",
  "summer",
  "fall",
  "winter",
] as const;

export type SeasonTag = (typeof ALLOWED_SEASONS)[number];

// -----------------------------------------------------------------------------
// Genders / Fits (3 tags)
// -----------------------------------------------------------------------------
export const ALLOWED_GENDERS = [
  "menswear",
  "womenswear",
] as const;

export type GenderCategory = (typeof ALLOWED_GENDERS)[number];

// -----------------------------------------------------------------------------
// Colors (20 tags)
// -----------------------------------------------------------------------------
export const ALLOWED_COLORS = [
  "black",
  "white",
  "off-white",
  "gray",
  "charcoal",
  "beige",
  "khaki",
  "brown",
  "navy",
  "light-blue",
  "denim-blue",
  "olive-green",
  "sage-green",
  "burgundy",
  "red",
  "pink",
  "cream",
  "camel",
  "yellow",
  "multicolor",
] as const;

export type ColorTag = (typeof ALLOWED_COLORS)[number];

// -----------------------------------------------------------------------------
// AI Analysis Output Interface
// -----------------------------------------------------------------------------
export interface FashionAnalysisResult {
  styles: StyleTag[];
  items: ItemCategory[];
  season: SeasonTag;
  gender: GenderCategory;
  colors: ColorTag[];
}

// Maximum hashtag tags allowed per post selection
export const MAX_HASHTAGS_PER_POST = 3;
