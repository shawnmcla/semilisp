import { makeFunction, rest } from "../../function.mjs";
import { Bool } from '../../types/primitiveTypes.mjs';

export const logicFunctions = [
    // Arithmetic
    makeFunction(
        "and", "Performs a logical and on all provided operands",
        [rest('operands', 'bool')], "bool",
        (...operands) => {
            const reduced = operands.slice(1).reduce((prev, cur) => prev && cur.value, operands[0].value);
            return new Bool(reduced);
        },
    ),
    makeFunction(
        "or", "Performs a logical or on all provided operands",
        [rest('operands', 'bool')], "bool",
        (...operands) => new Bool(operands.slice(1).reduce((prev, cur) => prev || cur.value, operands[0].value)),
    ),
]