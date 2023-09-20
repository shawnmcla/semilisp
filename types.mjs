import { Obj, Number, String, Bool } from "./types/primitiveTypes.mjs";

export const makeNumber = value => ({ type: "number", value: +value });
export const makeString = value => ({ type: "string", value: value?.toString() ?? "" });
export const makeBool = value => ({ type: "bool", value: (!!value) });
export const NIL = { type: 'nil', value: null, };


const n = new Number(10);
const b = n.coerceObjTo("bool");
const n2 = b.coerceObjTo("number");
const s = b.coerceObjTo("string");
const s2 = new String("5.25");
const n3 = s2.coerceObjTo("number");

console.log(n, b, n2, s, n3);