import { makeFunction } from "../function.mjs";
import { arg, rest, makeString, makeNumber } from '../util.mjs';

export const stringFunctions = [
    makeFunction(
        "str-cat", "Concats an arbitrary number of strings together",
        [rest('operands', 'string')], "string",
        (...operands) => makeString(operands.map(o => o?.value?.toString() ?? "").join(''))
    ),
    makeFunction(
        "str-lower", "Converts a string to lowercase",
        [arg('string', 'string')], "string",
        (string) => makeString(string?.value?.toLowerCase())
    ),
    makeFunction(
        "str-upper", "Converts a string to uppercase",
        [arg('string', 'string')], "string",
        (string) => makeString(string?.value?.toUpperCase())
    ),
    makeFunction(
        "str-repeat", "Repeats a string the specified number of times",
        [arg('string', 'string'), arg('times', 'number')], "string",
        (string, times) => makeString(string?.value?.repeat(times?.value))
    ),
    makeFunction(
        "str-len", "Returns the length of a string",
        [arg('string', 'string')], "number",
        (string) => makeNumber(string?.value?.length ?? 0)
    ),

];