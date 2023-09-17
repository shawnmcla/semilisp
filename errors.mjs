export class ParsingError extends Error { }

export class RuntimeError extends Error { }
export class UnboundSymbolError extends RuntimeError { }

export const unboundSymbol = (symbol, sourceInfo = null) => {
    const errorMessage = `Unbound symbol '${symbol}'${sourceInfo ? `" at line ${sourceInfo.line}, col ${sourceInfo.col}` : ''}`;
    throw new UnboundSymbolError(errorMessage);
}

export const unexpectedCharacter = (character, sourceInfo = null) => {
    const errorMessage = `Unexpected character '${character}'${sourceInfo ? `" at line ${sourceInfo.line}, col ${sourceInfo.col}` : ''}`;
    throw new ParsingError(errorMessage);
}