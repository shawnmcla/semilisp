import { arg, rest, makeFunction } from "../../function.mjs";
import { makeNumber, makeBool, NIL } from '../../types.mjs';

export const ioFunctions = [
    // Stdout
    makeFunction(
        "io-print", "Outputs the provided string to the standard output",
        [arg('string', 'string')], "nil",
        // TODO: Configurable stdout stream
        (string) => (console.log(string?.value.toString() ?? ""), NIL),
    ),
    makeFunction(
        // TODO - support this
        "io-println", "Outputs the provided string to the standard output, appending a new line at the end",
        [arg('string', 'string')], "nil",
        // TODO: Configurable stdout stream
        (string) => (console.log((string?.value.toString() ?? "") + "\n"), NIL),
    ),
]