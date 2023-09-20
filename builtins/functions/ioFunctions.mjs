import { param, rest, makeFunction } from "../../function.mjs";
import { Number, Bool, NIL } from '../../types/primitiveTypes.mjs';

export const ioFunctions = [
    // Stdout
    makeFunction(
        "io-print", "Outputs the provided string to the standard output",
        [param('string', 'string')], "nil",
        // TODO: Configurable stdout stream
        (string) => (console.log(string?.value.toString() ?? ""), NIL),
    ),
    makeFunction(
        // TODO - support this
        "io-println", "Outputs the provided string to the standard output, appending a new line at the end",
        [param('string', 'string')], "nil",
        // TODO: Configurable stdout stream
        (string) => (console.log((string?.value.toString() ?? "") + "\n"), NIL),
    ),
]