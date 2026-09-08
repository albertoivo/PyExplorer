import { describe, it, expect } from 'vitest';
import { parseMarkdown, escapeHtml } from '../markdownParser';

describe('markdownParser', () => {
    describe('escapeHtml', () => {
        it('escapes basic html', () => {
            expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
            expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
            expect(escapeHtml("'test'")).toBe('&#039;test&#039;');
            expect(escapeHtml('1 & 2')).toBe('1 &amp; 2');
        });
    });

    describe('parseMarkdown', () => {
        it('parses bold correctly non-greedy', () => {
            const input = 'This is **bold1** and this is **bold2**';
            const expected = '<p>This is <strong>bold1</strong> and this is <strong>bold2</strong></p>';
            expect(parseMarkdown(input)).toBe(expected);
        });

        it('parses italic correctly non-greedy', () => {
            const input = 'This is *italic1* and this is *italic2*';
            const expected = '<p>This is <em>italic1</em> and this is <em>italic2</em></p>';
            expect(parseMarkdown(input)).toBe(expected);
        });

        it('parses lists correctly', () => {
            const input = '- Item 1\n- Item 2';
            const expected = '<p><li>Item 1</li>\n<li>Item 2</li></p>';
            expect(parseMarkdown(input)).toBe(expected);
        });

        it('parses checkmarks correctly', () => {
            const input = '- ✅ Check 1\n- Item 2';
            const expected = '<p><li class="check">✅ Check 1</li>\n<li>Item 2</li></p>';
            expect(parseMarkdown(input)).toBe(expected);
        });

        it('parses line breaks correctly', () => {
            const input = 'Line 1\n\nLine 2';
            const expected = '<p>Line 1</p><p>Line 2</p>';
            expect(parseMarkdown(input)).toBe(expected);
        });
    });
});
