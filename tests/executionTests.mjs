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
const quotedList1 = run(`'(1 2 3)`)?.result;
assert.equal(quotedList1?.type, 'list', "Quoted list is list");
assert.equal(quotedList1?.quoted, true, "Quoted list is quoted");
assert.equal(quotedList1?.children?.length, 3, "Quoted list has 3 children");

// -- Special forms
// If 
assert.equal(valueFrom(`(if true 3 5)`), 3, "If call (true) on literals");
assert.equal(valueFrom(`(if false 3 5)`), 5, "If call (false) on literals");
assert.equal(valueFrom(`(if true (+ 1 2) (* 3 10))`), 3, "If call (true) on two lists");
assert.equal(valueFrom(`(if false (+ 1 2) (* 3 10))`), 30, "If call (false) on two lists");
// Do
assert.equal(valueFrom(`(do (+ 1 2) (* 10 3))`), 30, "do special form returns last evaluated expression");
// Case
assert.equal(valueFrom(`(case (true 1) (false 0))`), 1, "First case true");
assert.equal(valueFrom(`(case (false 1) (true 0))`), 0, "Second case true");
assert.equal(valueFrom(`(case (false 0) (false 1) (true (+ 1 2)))`), 3, "Third case true, function call in result");
assert.equal(valueFrom(`(case (false 0) (false 1) (:else 100))`), 100, "All false, else (default) case");
assert.equal(valueFrom(`(case (:else 100) (false 1) (false 0))`), 100, "All false, else (default) case but coming first");
assert.equal(valueFrom(`(case (:else 0) (false 1) (true 100))`), 100, "Third case true, else (default) case coming first but not triggered");
// Eval
assert.equal(valueFrom(`(eval '(+ 1 2))`), 3, "Evaluating a quoted list");
assert.equal(valueFrom(`(eval 1)`), 1, "Evaluating an atom");
// Let
assert.equal(valueFrom(`(let (x 2) (+ x 10))`), 12, "Let binding");
assert.equal(valueFrom(`(let (x 100) (let (x 2) (+ x 10)))`), 12, "Nested let bindings (inside)");
assert.equal(valueFrom(`
(let (x 100) 
  (do 
    (let (x 2) (+ x 10))
    (/ x 10)
))`), 10, "Nested let bindings (outside)");
// Def
assert.equal(valueFrom(`(do (def x 100) (+ x x))`), 200, "Defining a global variable");
assert.equal(valueFrom(`(do (def x 100) (let (x 10) (+ x x)))`), 20, "Defining a global variable and shadowing it");
assert.equal(valueFrom(`(do (do (def x 10)) (+ x x))`), 20, "Defining a global variable and using it outside current expression");
// Defun
assert.equal(valueFrom(`(do (defun one () (1)) (one))`), 1, "Simple zero-parameter function")
assert.equal(valueFrom(`(do (defun addOneTo (x) (+ x 1)) (addOneTo 10))`), 11, "Simple one-parameter function")
assert.equal(valueFrom(`(do (defun addTwoNumbers (x y) (+ x y)) (addTwoNumbers 6 9))`), 15, "Simple two-parameter function")
assert.equal(valueFrom(`(do (defun isEven (x) (= 0 (% x 2))) (isEven 2))`), true, "Function returning bool")
assert.equal(valueFrom(`(do (defun fact (n) (if (= n 1) 1 (+ n (fact (- n 1))))) (fact 10))`), 55, "Recursion")