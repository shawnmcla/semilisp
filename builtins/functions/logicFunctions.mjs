import { arg, rest, makeFunction } from "../../function.mjs";
import { makeNumber, makeBool } from '../../types.mjs';

export const logicFunctions = [
    // Arithmetic
    makeFunction(
        "and", "Performs a logical and on all provided operands",
        [rest('operands', 'bool')], "bool",
        (...operands) => {
            console.log(operands);
            console.log(operands.map(o => o.value).join(" AND "));
            const reduced = operands.slice(1).reduce((prev, cur) => prev && cur.value, operands[0].value);
            console.log("Reduced to", reduced);
            return makeBool(reduced);
        },
    ),
    makeFunction(
        "or", "Performs a logical or on all provided operands",
        [rest('operands', 'bool')], "bool",
        (...operands) => makeBool(operands.slice(1).reduce((prev, cur) => prev || cur.value, operands[0].value)),
    ),

    
]