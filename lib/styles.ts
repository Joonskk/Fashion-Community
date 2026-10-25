import { ALLOWED_STYLES, MAX_HASHTAGS_PER_POST, StyleTag } from "@/lib/constants";
import { extractHashtags } from "@/lib/hashtags";

export function mergeStyles(
    userStyles: string[],
    description: string,
    aiStyles: string[],
): StyleTag[] {
    // 1. Extract hashtags written in description (if any)
    const captionHashtags = extractHashtags(description);

    // 2. Combine caption tags with selected button styles
    const combinedRawStyles = [...userStyles, ...captionHashtags, ...(aiStyles),];

    // 3. Clean raw tags and validate against ALLOWED_STYLES taxonomy
    const validStyles = combinedRawStyles
      .map((tag: string) => tag.toLowerCase().trim())
      .filter((tag: string): tag is StyleTag =>
        (ALLOWED_STYLES as readonly string[]).includes(tag)
      );

    // 4. Deduplicate tags
    const uniqueStyles = Array.from(new Set(validStyles));

    // 5. Enforce strict cap (Max 3 tags per post)
    const finalStyles = uniqueStyles.slice(0, MAX_HASHTAGS_PER_POST);
    
    return finalStyles;
}