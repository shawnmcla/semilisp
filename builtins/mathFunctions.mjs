import { makeFunction } from "../function.mjs";
import { arg, rest, makeNumber } from '../util.mjs';

export const mathFunctions = [
    // Arithmetic
    makeFunction(
        "add", "Performs addition of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => makeNumber(operands.slice(1).reduce((prev, cur) => (prev) + cur.value, operands[0].value)),
        ["+"]
    ),
    makeFunction(
        "sub", "Performs subtraction of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => makeNumber(operands.slice(1).reduce((prev, cur) => (prev) - cur.value, operands[0].value)),
        ["-"]
    ),
    makeFunction(
        "mul", "Performs multiplication of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => makeNumber(operands.slice(1).reduce((prev, cur) => (prev) * cur.value, operands[0].value)),
        ["*"]
    ),
    makeFunction(
        "div", "Performs division of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => makeNumber(operands.slice(1).reduce((prev, cur) => (prev) / cur.value, operands[0].value)),
        ["/"]
    ),

    makeFunction(
        "pow", "Raises the base value to the power specified",
        [arg('base', 'number'), arg('power', 'number')], "number",
        (base, power) => makeNumber(Math.pow(base.value, power.value)),
        ["^"]
    ),


    // Comparison
    makeFunction(
        "=", "Compares the first operand to the second, returning true if they are equal",
        [arg('first', 'number'), arg('second', 'number')], "bool",
        (first, second) => makeBool(first.value === second.value)
    ),
    makeFunction(
        ">", "Compares the first operand to the second, returning true if the first is greater",
        [arg('first', 'number'), arg('second', 'number')], "bool",
        (first, second) => makeBool(first.value > second.value)
    ),
    makeFunction(
        "<", "Compares the first operand to the second, returning true if the first is lesser",
        [arg('first', 'number'), arg('second', 'number')], "bool",
        (first, second) => makeBool(first.value < second.value)
    ),
    makeFunction(
        ">=", "Compares the first operand to the second, returning true if the first is greater OR equal",
        [arg('first', 'number'), arg('second', 'number')], "bool",
        (first, second) => makeBool(first.value >= second.value)
    ),
    makeFunction(
        "<=", "Compares the first operand to the second, returning true if the first is lesser OR equal",
        [arg('first', 'number'), arg('second', 'number')], "bool",
        (first, second) => makeBool(first.value <= second.value)
    ),

    // Misc
    makeFunction(
        "rand-int", "Generates a pseudo-random integer in the range [min, max)",
        [arg('min', 'number'), arg('max', 'number')], "number",
        (min, max) => makeNumber(Math.floor(Math.random() * (max.value - min.value) + min.value))
    )

    
]