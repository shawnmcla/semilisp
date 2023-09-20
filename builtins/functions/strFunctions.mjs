import { param, rest, makeFunction } from "../../function.mjs";
import { String, Number } from '../../types/primitiveTypes.mjs';

export const stringFunctions = [
    makeFunction(
        "str-cat", "Concats an arbitrary number of strings together",
        [rest('operands', 'string')], "string",
        (...operands) => new String(operands.map(o => o?.value?.toString() ?? "").join(''))
    ),
    makeFunction(
        "str-lower", "Converts a string to lowercase",
        [param('string', 'string')], "string",
        (string) => new String(string?.value?.toLowerCase())
    ),
    makeFunction(
        "str-upper", "Converts a string to uppercase",
        [param('string', 'string')], "string",
        (string) => new String(string?.value?.toUpperCase())
    ),
    makeFunction(
        "str-repeat", "Repeats a string the specified number of times",
        [param('string', 'string'), param('times', 'number')], "string",
        (string, times) => new String(string?.value?.repeat(times?.value))
    ),
    makeFunction(
        "str-len", "Returns the length of a string",
        [param('string', 'string')], "number",
        (string) => new Number(string?.value?.length ?? 0)
    ),

];