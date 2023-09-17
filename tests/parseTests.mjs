import { strict as assert } from "node:assert";
import { parse } from "../parser.mjs";

let res;
res = parse(`'(1 2 3)`)?.children[0];
assert(res.type === 'list' && res.quoted, "Parsing a quoted list");
assert.equal(res.children.length, 3, "List has three children");
assert.equal(res.children[0].type, 'number', "List has number type children");
assert.equal(res.children[0].value, 1, "List has correct number values");

res = parse(`(+ x y)`)?.children[0];
assert(res.type === 'list' && !res.quoted, "Parsing a regular list");
assert.equal(res.children.length, 3, "List has three children");
assert.equal(res.children[0].type, 'symbol', "List has symbol type children");

res = parse(`(+ (* 3 10) (/ 100 10))`)?.children[0];
assert(res.type === 'list' && !res.quoted, "Parsing a regular list with list children");
assert.equal(res.children.length, 3, "List has three children");
assert(res.children[0].type === 'symbol' && res.children[1].type === 'list' && res.children[2].type === 'list');
