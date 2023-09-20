export class ParsingError extends Error { }

export class RuntimeError extends Error { }
export class UnboundSymbolError extends RuntimeError { }
export class NotAFunctionError extends RuntimeError { }

export const unboundSymbol = (symbol, sourceInfo = null) => {
    const errorMessage = `Unbound symbol '${symbol}'${sourceInfo ? `" at line ${sourceInfo.line}, col ${sourceInfo.col}` : ''}`;
    throw new UnboundSymbolError(errorMessage);
}

export const notAFunction = (obj, sourceInfo = null) => {
    const errorMessage = `'${obj}' is not a function ${sourceInfo ? `" at line ${sourceInfo.line}, col ${sourceInfo.col}` : ''}`;
    throw new UnboundSymbolError(errorMessage);
}

export const unexpectedCharacter = (character, sourceInfo = null) => {
    const errorMessage = `Unexpected character '${character}'${sourceInfo ? `" at line ${sourceInfo.line}, col ${sourceInfo.col}` : ''}`;
    throw new ParsingError(errorMessage);
}

export const unterminatedString = (sourceInfo = null) => {
    const errorMessage = `Unterminated string literal ${sourceInfo ? `at line ${sourceInfo.line}, col ${sourceInfo.col}` : ''}`;
    throw new ParsingError(errorMessage);
}

export const invalidEscapeChar = (character, sourceInfo = null) => {
    const errorMessage = `Unexpected escape character '${character}'${sourceInfo ? `" at line ${sourceInfo.line}, col ${sourceInfo.col}` : ''}`;
    throw new ParsingError(errorMessage);
}
