import { strict as assert } from "node:assert";
import { run } from "../toylisp.mjs";

const noValue = Symbol("NO VALUE");
const threwError = Symbol("THREW ERROR");

const valueFrom = (code) => {
    try {
        const runResult = run(code);
        if (!runResult) return noValue;
        if(runResult.hadError) return threwError;

        return runResult.result.value;
    } catch (e) {
        return e;
    }
}

// Literals and atoms
assert.equal(valueFrom(`true`), true, "Boolean atom for true");
assert.equal(valueFrom(`false`), false, "Boolean atom for true");

assert.equal(valueFrom(`5`), 5, "Integer literal");
assert.equal(valueFrom(`6.25`), 6.25, "Float literal");

assert.equal(valueFrom(`"foo"`), "foo", "String literal");

// Basic math functions
assert.equal(valueFrom(`(+ 1 2)`), 3, "Basic 2-param addition");
assert.equal(valueFrom(`(+ 1 2 3 4 5)`), 15, "Arbitrary arity addition");
assert.equal(valueFrom(`(+ -10 -5)`), -15, "Adding negative literals");
assert.equal(valueFrom(`(- 9 15)`), -6, "Subtract two numbers");
assert.equal(valueFrom(`(* 7 3)`), 21, "Multiply two numbers");
assert.equal(valueFrom(`(/ 33 11)`), 3, "Divide two numbers");
assert.equal(valueFrom(`(// 10 3)`), 3, "Int divide two numbers");
assert.equal(valueFrom(`(pow 3 2)`), 9, "Pow function");

let x = valueFrom(`(rand-int 1 5)`);
assert(x >= 1 && x < 5, `Random value between [1 and 5) (was: ${x})`);

// Program evaluation
assert.equal(valueFrom(`(+ 1 2) (* 3 10)`), 30, "Program return value is last evaluated expression")

// Quoted lists
const quotedList1 = run(`'(1 2 3)`);
assert.equal(quotedList1?.type, 'list', "Quoted list is list");
assert.equal(quotedList1?.quoted, true, "Quoted list is quoted");
assert.equal(quotedList1?.children?.length, 3, "Quoted list has 3 children");

assert.equal(valueFrom(`(eval '(+ 1 2))`), 3, "Evaluating a quoted list");

// If calls
assert.equal(valueFrom(`(if true 3 5)`), 3, "If call (true) on literals");
assert.equal(valueFrom(`(if false 3 5)`), 5, "If call (false) on literals");

assert.equal(valueFrom(`(if true (+ 1 2) (* 3 10))`), 3, "If call (true) on two lists");
assert.equal(valueFrom(`(if false (+ 1 2) (* 3 10))`), 30, "If call (false) on two lists");
