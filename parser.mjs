import { unexpectedCharacter } from "./errors.mjs";
import { isDigit, isValidIdentifierChar, isWhitespace } from "./util.mjs";

export const parse = (src) => {
    let i = 0;

    let line = 1;
    let lastNewLine = 1;

    const root = { type: "list", prev: null, children: [] };
    let current = root;

    const beginList = (quoted = false) => {
        const tree = { type: "list", prev: current, children: [], start: i - 1, quoted, sourceLine: line, sourceCol: i - lastNewLine };
        current.children.push(tree);
        current = tree;
    }

    const endList = () => {
        if(!current) unexpectedCharacter(src[i - 1]);
        current.end = i;
        current.src = src.substring(current.start - (current.quoted ? 1 : 0), current.end);
        current = current.prev;
    }

    const advance = () => src[i++];

    const peek = () => src[i];

    const isAtEnd = () => i >= src.length;

    const emitNumber = (lexeme) => ({ type: "number", lexeme, value: parseFloat(lexeme) });
    const emitString = (lexeme) => ({ type: "string", lexeme, value: lexeme.substring(1, lexeme.length - 1) });
    const emitSymbol = (lexeme) => ({ type: "symbol", lexeme, value: lexeme });

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
            let start = i - 1;
            while (!isAtEnd() && peek() !== '"') advance();
            advance();
            current.children.push(emitString(src.substring(start, i)));
        }

        else {
            let start = i - 1;
            while (!isAtEnd() && /[^\s\(\)]/.test(peek())) advance();
            current.children.push(emitSymbol(src.substring(start, i)));
        }
    }

    return root;
}
