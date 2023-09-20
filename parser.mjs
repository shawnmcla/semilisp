import { invalidEscapeChar, unexpectedCharacter, unterminatedString } from "./errors.mjs";
import { ParserList } from "./types/collections.mjs";
import { Keyword, Number, String, Symbol } from "./types/primitiveTypes.mjs";
import { isDigit, isWhitespace } from "./util.mjs";

export const parse = (src) => {
    let i = 0;

    let line = 1;
    let lastNewLine = 1;

    const root = new ParserList(null, true);
    root.prev = null;
    root.root = true;

    let current = root;

    const beginList = (quoted = false) => {
        const tree = new ParserList(current, false, [], quoted, { sourceLine: line, sourceCol: i - lastNewLine });
        current.children.push(tree);
        current = tree;
    }

    const endList = () => {
        if (!current) unexpectedCharacter(src[i - 1]);
        current.end = i;
        current.src = src.substring(current.start - (current.quoted ? 1 : 0), current.end);
        current = current.prev;
    }

    const advance = () => src[i++];

    const peek = () => src[i];
    const peekNext = () => src[i + 1];

    const isAtEnd = () => i >= src.length;

    const emitNumber = (lexeme) => new Number(parseFloat(lexeme)); //({ type: "number", lexeme, value: parseFloat(lexeme) });
    const emitString = (lexeme) => new String(lexeme.substring(1, lexeme.length - 1)); //({ type: "string", lexeme, value: lexeme.substring(1, lexeme.length - 1) });
    const emitSymbol = (lexeme) => new Symbol(lexeme);
    const emitKeyword = (lexeme) => new Keyword(lexeme.substring(1));

    while (!isAtEnd()) {
        let c = advance();
        if (isWhitespace(c)) {
            if (c === '\n') {
                line++;
                lastNewLine = i;
            }
            continue;
        }

        if (c === '(') {
            beginList();
        }

        else if (c === ')') {
            endList();
        }

        else if (c === "'" && peek() === '(') {
            advance();
            beginList(true);
        }

        else if (isDigit(c) || c === '-' && isDigit(peek())) {
            let start = i - 1;
            // TODO: Do not allow multiple points in numeric values :)
            while (!isAtEnd() && isDigit(peek()) || peek() == '.') advance();
            current.children.push(emitNumber(src.substring(start, i)));
        }

        else if (c === '"') {
            const stringParts = [c];
            while (true) {
                const peeked = peek();
                if (isAtEnd()) {
                    unterminatedString();
                }
                else if (peeked === '"') {
                    break;
                }
                else if (peeked === '\\') {
                    let next = peekNext();
                    switch (next) {
                        case '\\':
                            stringParts.push('\\');
                            break;
                        case 'n':
                            stringParts.push('\n');
                            break;
                        case 't':
                            stringParts.push('\t');
                            break;
                        case '"':
                            stringParts.push('"');
                            break;
                        default:
                            invalidEscapeChar(next);
                    }
                    advance();
                    advance();
                }
                else {
                    stringParts.push(peeked);
                    advance();
                }
            }
            stringParts.push(advance());
            current.children.push(emitString(stringParts.join('')));
        }
        else if(c === ':' &&  /[^\s\(\)]/.test(peek())) {
            let start = i - 1;
            while (!isAtEnd() && /[^\s\(\)]/.test(peek())) advance();
            current.children.push(emitKeyword(src.substring(start, i)));
        }
        else {
            let start = i - 1;
            while (!isAtEnd() && /[^\s\(\)]/.test(peek())) advance();
            current.children.push(emitSymbol(src.substring(start, i)));
        }
    }

    return root;
}
