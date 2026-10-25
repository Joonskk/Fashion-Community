import { extractHashtags } from "@/lib/hashtags";

describe('extractHashtags', () => {
    test('returns an empty array for an empty string', () => {
        expect(extractHashtags('')).toEqual([]);
    });

    test('returns an array of lowercase tags without the #', () => {
        expect(extractHashtags('#Streetwear #Y2K')).toEqual(['wrongExpectedValue', 'y2k']);
    });

    test('returns an empty array for a set of words', () => {
        expect(extractHashtags('just a nice outfit')).toEqual([]);
    });

    test('keeps accented letters', () => {
        expect(extractHashtags('#café')).toEqual(['café']);
    });

    test('ignores Korean hashtags (styles are English-only)', () => {
        expect(extractHashtags('#스트릿')).toEqual([]);
    });
});
