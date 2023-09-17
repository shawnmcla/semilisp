import { makeFunction } from "../function.mjs";
import { arg, rest, makeNumber } from '../util.mjs';


//         [
//             "if", {
//                 type: 'function',
//                 name: "if",
//                 parameters: [{ type: "bool", name: "condition" }, { type: "any", name: "ifTrue" }, { type: "any", name: "elseThen" },],
//                 impl: (condition, ifTrue, elseThen) => {
//                     const res = condition.value ? ifTrue : elseThen;
//                     if (res.type === 'list') return evalList(res);
//                     return res;
//                 }
//             },
//         ],


//         [
//             "eval", {
//                 type: 'function',
//                 name: "eval",
//                 parameters: [{ type: "list", name: "list" }],
//                 impl: (list) => evalList(list)
//             },
//         ],