import { escapeRegex } from "@/lib/escapeRegex";

describe('escapeRegex', () => {
    test('returns the pure word itself', () => {
        expect(escapeRegex('jacket')).toBe('jacket');
    })

    test('escapes parentheses', () => {
        expect(escapeRegex('(jacket)')).toBe('\\(jacket\\)');
    })

    test('escapes dot', () => {
        expect(escapeRegex('a.b')).toBe('a\\.b');
    })
})