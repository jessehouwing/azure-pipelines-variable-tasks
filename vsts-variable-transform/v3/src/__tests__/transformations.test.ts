import {
    encodeStringValue,
    decodeStringValue,
    stripSlashes,
    addSlashes,
    searchAndReplace,
    applyManipulations,
} from '../transformations';

describe('encodeStringValue', () => {
    it('should encode URI', () => {
        expect(encodeStringValue('hello world', 'uri')).toBe('hello%20world');
    });

    it('should encode URI with special characters', () => {
        expect(encodeStringValue('https://example.com/path?q=hello world', 'uri'))
            .toBe('https://example.com/path?q=hello%20world');
    });

    it('should encode URI component', () => {
        expect(encodeStringValue('hello world&foo=bar', 'uriComponent'))
            .toBe('hello%20world%26foo%3Dbar');
    });

    it('should encode base64', () => {
        expect(encodeStringValue('Hello World', 'base64')).toBe('SGVsbG8gV29ybGQ=');
    });

    it('should encode base64 empty string', () => {
        expect(encodeStringValue('', 'base64')).toBe('');
    });

    it('should encode slashes', () => {
        expect(encodeStringValue('hello "world"', 'slashes')).toBe('hello \\"world\\"');
    });

    it('should return NOT IMPLEMENTED for unknown method', () => {
        expect(encodeStringValue('test', 'unknown')).toBe('NOT IMPLEMENTED');
    });
});

describe('decodeStringValue', () => {
    it('should decode URI', () => {
        expect(decodeStringValue('hello%20world', 'uri')).toBe('hello world');
    });

    it('should decode URI component', () => {
        expect(decodeStringValue('hello%20world%26foo%3Dbar', 'uriComponent'))
            .toBe('hello world&foo=bar');
    });

    it('should decode base64', () => {
        expect(decodeStringValue('SGVsbG8gV29ybGQ=', 'base64')).toBe('Hello World');
    });

    it('should decode base64 empty string', () => {
        expect(decodeStringValue('', 'base64')).toBe('');
    });

    it('should decode slashes', () => {
        expect(decodeStringValue('hello \\"world\\"', 'slashes')).toBe('hello "world"');
    });

    it('should return NOT IMPLEMENTED for unknown method', () => {
        expect(decodeStringValue('test', 'unknown')).toBe('NOT IMPLEMENTED');
    });
});

describe('stripSlashes', () => {
    it('should strip backslash before double quote', () => {
        expect(stripSlashes('\\"hello\\"')).toBe('"hello"');
    });

    it('should strip backslash before single quote', () => {
        expect(stripSlashes("\\'hello\\'")).toBe("'hello'");
    });

    it('should handle escaped backslash', () => {
        expect(stripSlashes('\\\\')).toBe('\\');
    });

    it('should handle escaped null', () => {
        expect(stripSlashes('\\0')).toBe('\u0000');
    });

    it('should handle trailing backslash', () => {
        expect(stripSlashes('hello\\')).toBe('hello');
    });

    it('should pass through normal text', () => {
        expect(stripSlashes('hello world')).toBe('hello world');
    });
});

describe('addSlashes', () => {
    it('should escape double quotes', () => {
        expect(addSlashes('"hello"')).toBe('\\"hello\\"');
    });

    it('should escape single quotes', () => {
        expect(addSlashes("'hello'")).toBe("\\'hello\\'");
    });

    it('should escape backslashes', () => {
        expect(addSlashes('path\\to\\file')).toBe('path\\\\to\\\\file');
    });

    it('should escape null characters', () => {
        expect(addSlashes('hello\u0000world')).toBe('hello\\0world');
    });

    it('should handle empty string', () => {
        expect(addSlashes('')).toBe('');
    });
});

describe('searchAndReplace', () => {
    describe('basic method', () => {
        it('should replace exact match', () => {
            const result = searchAndReplace('hello world', {
                method: 'basic',
                search: 'world',
                replacement: 'universe',
            });
            expect(result.value).toBe('hello universe');
        });

        it('should replace all occurrences', () => {
            const result = searchAndReplace('aaa', {
                method: 'basic',
                search: 'a',
                replacement: 'b',
            });
            expect(result.value).toBe('bbb');
        });

        it('should handle no match', () => {
            const result = searchAndReplace('hello', {
                method: 'basic',
                search: 'xyz',
                replacement: 'abc',
            });
            expect(result.value).toBe('hello');
        });

        it('should handle empty search (splits on empty string)', () => {
            const result = searchAndReplace('hi', {
                method: 'basic',
                search: '',
                replacement: '-',
            });
            // split('') splits into individual characters, join('-') joins with separator
            expect(result.value).toBe('h-i');
        });
    });

    describe('regex method', () => {
        it('should replace with regex', () => {
            const result = searchAndReplace('hello 123 world', {
                method: 'regex',
                search: '\\d+',
                replacement: 'NUM',
            });
            expect(result.value).toBe('hello NUM world');
        });

        it('should support global flag', () => {
            const result = searchAndReplace('aaa', {
                method: 'regex',
                search: 'a',
                replacement: 'b',
                regexOptions: 'g',
            });
            expect(result.value).toBe('bbb');
        });

        it('should support case insensitive flag', () => {
            const result = searchAndReplace('Hello HELLO', {
                method: 'regex',
                search: 'hello',
                replacement: 'hi',
                regexOptions: 'gi',
            });
            expect(result.value).toBe('hi hi');
        });

        it('should support capture groups in replacement', () => {
            const result = searchAndReplace('2023-01-15', {
                method: 'regex',
                search: '(\\d{4})-(\\d{2})-(\\d{2})',
                replacement: '$2/$3/$1',
            });
            expect(result.value).toBe('01/15/2023');
        });
    });

    describe('match method', () => {
        it('should extract first match', () => {
            const result = searchAndReplace('version 1.2.3 released', {
                method: 'match',
                search: '\\d+\\.\\d+\\.\\d+',
                replacement: '',
            });
            expect(result.value).toBe('1.2.3');
        });

        it('should return empty with warning when no match', () => {
            const result = searchAndReplace('hello world', {
                method: 'match',
                search: '\\d+',
                replacement: '',
            });
            expect(result.value).toBe('');
            expect(result.warning).toBe('Found no matches');
        });

        it('should use regex options', () => {
            const result = searchAndReplace('Hello World', {
                method: 'match',
                search: 'hello',
                replacement: '',
                regexOptions: 'i',
            });
            expect(result.value).toBe('Hello');
        });
    });
});

describe('applyManipulations', () => {
    describe('trim', () => {
        it('should trim whitespace', () => {
            const result = applyManipulations('  hello  ', { trim: true });
            expect(result.value).toBe('hello');
        });

        it('should trim tabs and newlines', () => {
            const result = applyManipulations('\t\nhello\n\t', { trim: true });
            expect(result.value).toBe('hello');
        });
    });

    describe('slice', () => {
        it('should slice from left', () => {
            const result = applyManipulations('hello world', {
                slice: true,
                sliceLeft: '6',
                sliceRight: '',
            });
            expect(result.value).toBe('world');
        });

        it('should slice with right bound', () => {
            const result = applyManipulations('hello world', {
                slice: true,
                sliceLeft: '0',
                sliceRight: '5',
            });
            expect(result.value).toBe('hello');
        });

        it('should handle negative right', () => {
            const result = applyManipulations('hello world', {
                slice: true,
                sliceLeft: '0',
                sliceRight: '-6',
            });
            expect(result.value).toBe('hello');
        });
    });

    describe('substring', () => {
        it('should take substring from start', () => {
            const result = applyManipulations('hello world', {
                substring: true,
                substringType: 'substring',
                substringStart: '6',
                substringLength: '',
            });
            expect(result.value).toBe('world');
        });

        it('should take substring with length', () => {
            const result = applyManipulations('hello world', {
                substring: true,
                substringType: 'substring',
                substringStart: '0',
                substringLength: '5',
            });
            expect(result.value).toBe('hello');
        });

        it('should take left characters', () => {
            const result = applyManipulations('hello world', {
                substring: true,
                substringType: 'left',
                substringLength: '5',
            });
            expect(result.value).toBe('hello');
        });

        it('should not truncate if value is shorter than length (left)', () => {
            const result = applyManipulations('hi', {
                substring: true,
                substringType: 'left',
                substringLength: '5',
            });
            expect(result.value).toBe('hi');
        });

        it('should take right characters', () => {
            const result = applyManipulations('hello world', {
                substring: true,
                substringType: 'right',
                substringLength: '5',
            });
            expect(result.value).toBe('world');
        });

        it('should not truncate if value is shorter than length (right)', () => {
            const result = applyManipulations('hi', {
                substring: true,
                substringType: 'right',
                substringLength: '5',
            });
            expect(result.value).toBe('hi');
        });
    });

    describe('casing', () => {
        it('should convert to uppercase', () => {
            const result = applyManipulations('hello World', {
                casing: true,
                casingType: 'toUpper',
            });
            expect(result.value).toBe('HELLO WORLD');
        });

        it('should convert to lowercase', () => {
            const result = applyManipulations('Hello WORLD', {
                casing: true,
                casingType: 'toLower',
            });
            expect(result.value).toBe('hello world');
        });
    });

    describe('pad', () => {
        it('should pad left', () => {
            const result = applyManipulations('42', {
                pad: true,
                padType: 'left',
                padChar: '0',
                padLength: '5',
            });
            expect(result.value).toBe('00042');
        });

        it('should pad right', () => {
            const result = applyManipulations('hi', {
                pad: true,
                padType: 'right',
                padChar: '.',
                padLength: '5',
            });
            expect(result.value).toBe('hi...');
        });

        it('should use space as default pad character', () => {
            const result = applyManipulations('hi', {
                pad: true,
                padType: 'left',
                padChar: '',
                padLength: '5',
            });
            expect(result.value).toBe('   hi');
        });

        it('should not pad if already at length', () => {
            const result = applyManipulations('hello', {
                pad: true,
                padType: 'left',
                padChar: '0',
                padLength: '5',
            });
            expect(result.value).toBe('hello');
        });
    });

    describe('combined manipulations', () => {
        it('should apply trim then pad', () => {
            const result = applyManipulations('  hi  ', {
                trim: true,
                pad: true,
                padType: 'left',
                padChar: '0',
                padLength: '5',
            });
            expect(result.value).toBe('000hi');
        });

        it('should apply search/replace then casing', () => {
            const result = applyManipulations('hello world', {
                searchReplace: true,
                searchReplaceOptions: {
                    method: 'basic',
                    search: 'world',
                    replacement: 'universe',
                },
                casing: true,
                casingType: 'toUpper',
            });
            expect(result.value).toBe('HELLO UNIVERSE');
        });
    });
});
