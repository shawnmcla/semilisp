import { param, rest, makeFunction } from "../../function.mjs";
import { Number, Bool } from '../../types/primitiveTypes.mjs';

export const mathFunctions = [
    // Arithmetic
    makeFunction(
        "+", "Performs addition of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => new Number(operands.slice(1).reduce((prev, cur) => (prev) + cur.value, operands[0].value)),
    ),
    makeFunction(
        "-", "Performs subtraction of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => new Number(operands.slice(1).reduce((prev, cur) => (prev) - cur.value, operands[0].value)),
    ),
    makeFunction(
        "*", "Performs multiplication of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => new Number(operands.slice(1).reduce((prev, cur) => (prev) * cur.value, operands[0].value)),
    ),
    makeFunction(
        "/", "Performs division of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => new Number(operands.slice(1).reduce((prev, cur) => (prev) / cur.value, operands[0].value)),
    ),
    makeFunction(
        "//", "Performs integer division of two numeric values (truncating any decimals from the result)",
        [param('x', 'number'), param('y', 'number')], "number",
        (x, y) => new Number(Math.floor(x?.value / y?.value)),
    ),
    makeFunction(
        "%", "Returns the result of x modulo y",
        [param('x', 'number'), param('y', 'number')], "number",
        (x, y) => new Number(x?.value % y?.value),
    ),

    makeFunction(
        "pow", "Raises the base value to the power specified",
        [param('base', 'number'), param('power', 'number')], "number",
        (base, power) => new Number(Math.pow(base.value, power.value))
    ),


    // Comparison
    makeFunction(
        "=", "Compares the first operand to the second, returning true if they are equal",
        [param('first', 'number'), param('second', 'number')], "bool",
        (first, second) => new Bool(first.value === second.value)
    ),
    makeFunction(
        ">", "Compares the first operand to the second, returning true if the first is greater",
        [param('first', 'number'), param('second', 'number')], "bool",
        (first, second) => new Bool(first.value > second.value)
    ),
    makeFunction(
        "<", "Compares the first operand to the second, returning true if the first is lesser",
        [param('first', 'number'), param('second', 'number')], "bool",
        (first, second) => new Bool(first.value < second.value)
    ),
    makeFunction(
        ">=", "Compares the first operand to the second, returning true if the first is greater OR equal",
        [param('first', 'number'), param('second', 'number')], "bool",
        (first, second) => new Bool(first.value >= second.value)
    ),
    makeFunction(
        "<=", "Compares the first operand to the second, returning true if the first is lesser OR equal",
        [param('first', 'number'), param('second', 'number')], "bool",
        (first, second) => new Bool(first.value <= second.value)
    ),

    // Misc
    makeFunction(
        "rand-int", "Generates a pseudo-random integer in the range [min, max)",
        [param('min', 'number'), param('max', 'number')], "number",
        (min, max) => new Number(Math.floor(Math.random() * (max.value - min.value) + min.value))
    )

    
]