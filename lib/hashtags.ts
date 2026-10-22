

// Helper function to extract hashtags from raw description text
export function extractHashtags(text: string): string[] {
    if (!text) return [];
    const matches = text.match(/#[\w\u00C0-\u024F]+/g);
    if (!matches) return [];
    return matches.map((tag) => tag.slice(1).toLowerCase());
}