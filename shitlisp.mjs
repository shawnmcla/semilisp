import { parse } from './parser.mjs';
import { stringify, makeNumber, makeString, makeBool, arg } from './util.mjs';
import { mathFunctions } from './builtins/mathFunctions.mjs';
import { makeFunction } from './function.mjs';

const builtinFunctions = [...mathFunctions];

const specialForms = new Map([
    ["if", {
        type: 'special',
        name: 'if',
        impl: (_, form) => {
            const conditionResultObject = valueOf(form.children[1]);
            // TODO: Add validation/sanity checks
            if (conditionResultObject.type !== 'bool') throw new Error("expected bool (TODO)");
            const thenForm = form.children[2];
            const elseForm = form.children[3];
            if (conditionResultObject.value) {
                return valueOf(thenForm);
            }
            return valueOf(elseForm);
        }
    }], ["eval", {
        type: 'special',
        name: 'eval',
        impl: (env, form) => {
            const toEval = form.children[1];
            if (toEval == null) throw new Error("Expected something TODO");
            if (toEval?.type === 'list') return evalList(toEval);
            return valueOf(toEval);
        }
    }], ["let", {
        type: 'special',
        name: 'let',
        impl: (env, form) => {
            if (form.children[1].type !== 'symbol') throw new Error("Expected symbol (TODO)");
            // TODO: Refine this
            const value = valueOf(form.children[2]);
            env.vars.set(form.children[1].value, value);
            return value;
        }
    }],
    ["defun", {
        type: 'special',
        name: 'defun',
        impl: (env, form) => {
            const [_, functionName, parameters, body] = form.children;
            if (functionName?.type !== 'symbol') throw new Error("Expected symbol (TODO)");
            if (parameters?.type !== 'list') throw new Error("Expected list (TODO)");
            if (body?.type !== 'list') throw new Error("Expected list (TODO)");

            // TODO: Refine this
            const func = makeFunction(
                functionName.value,
                "Custom function", //todo?
                parameters.children.map(c => arg(c.value, 'any')), 'any',
                (...args) => {
                    // todo: enter new scope with args bound
                    return evalList(form.children[3]);
                    // todo: exit scope
                }
            );

            env.vars.set(form.children[1].value, func);
            return func;
        }
    }]
]);

const world = { vars: new Map([["true", { type: 'bool', value: true }], ["false", { type: 'bool', value: false }]]) };

const builtins = new Map();
for (const builtinFunc of builtinFunctions) {
    builtins.set(builtinFunc.name, builtinFunc);
    for (const alias of builtinFunc.aliases) {
        builtins.set(alias, builtinFunc);
    }
}


//         [
//             "rand-int", {
//                 type: 'function',
//                 name: "rand-int",
//                 parameters: [{ type: "number", name: "min" }, { type: "number", name: "max" }],
//                 impl: (min, max) => makeNumber(Math.floor(Math.random() * (max.value - min.value + 1) + min.value))
//             }
//         ],
//         [
//             "concat", {
//                 type: 'function',
//                 name: "concat",
//                 parameters: [{ type: "string", rest: true, name: "operands" }],
//                 impl: (...operands) => makeString(operands.map(o => o.value).join(''))
//             },
//         ],
//         [
//             "repeat", {
//                 type: 'function',
//                 name: "repeat",
//                 parameters: [{ type: "number", name: "times" }, { type: "string", name: "string" }],
//                 impl: (times, string) => makeString(string.value.repeat(times.value))
//             },
//         ],


//         [
//             "print", {
//                 type: 'function',
//                 name: "print",
//                 parameters: [{ type: "any", rest: true, name: "operands" }],
//                 impl: (...operands) => console.log(`> ${operands.map(stringify).join(" ")}`)
//             },
//         ]
//     ]
// );

const resolve = (symbol) => {
    if (specialForms.has(symbol)) return specialForms.get(symbol);
    else if (world.vars.has(symbol)) return world.vars.get(symbol);
    else if (builtins.has(symbol)) return builtins.get(symbol);

    throw new Error(`Unresolvable symbol "${symbol}"`);
}

const valueOf = (obj) => {
    if (obj.type === 'symbol') {
        return resolve(obj.value);
    }
    else if (obj.type === 'list' && !obj.quoted) {
        return evalList(obj);
    }
    else return obj;
}



const convert = (obj, targetType) => {
    if (targetType === 'any' || obj.type === targetType) return obj;

    if (targetType === 'bool') {
        let boolValue;

        if (obj.type === 'number') boolValue = obj.value >= 0;
        else if (obj.type === 'string') boolValue = (obj.value?.length ?? 0) >= 0;
        else boolValue = true;

        return makeBool(boolValue);
    }

    if (targetType === 'number') {
        let numberValue;

        if (obj.type === 'number') numberValue = obj.value;
        else if (obj.type === 'string') numberValue = parseFloat(obj.value);
        else numberValue = NaN;

        return makeNumber(numberValue);
    }

    if (targetType === 'string') {
        let stringValue;

        if (obj.type === 'string') stringValue = obj.value;
        else if (obj.type === 'bool') stringValue = obj.value ? 'true' : 'false';
        else if (obj.type === 'number') stringValue = obj.value.toString();
        else stringValue = "";

        return makeString(stringValue);
    }


}

const callFunction = (func, ...args) => {
    const _arguments = [];
    let argIndex = 0;
    for (let param of func.parameters) {
        if (param.rest) {
            for (let i = argIndex; i < args.length; i++) {
                let arg = args[i];
                arg = convert(arg, param.type);
                _arguments.push(arg);
            }
        }
        else {
            let arg = args[argIndex];
            arg = convert(args[argIndex], param.type);
            _arguments.push(arg);

            argIndex++;
        }
    }

    return func.impl(..._arguments);
}

const evalList = (node) => {
    if (node.children.length === 0) return;

    const first = valueOf(node.children[0]);


    if (first.type === 'special') {
        return first.impl(world, node)
    }
    else if (first.type === 'function') {
        const args = node.children.slice(1).map(valueOf);
        return callFunction(first, ...args);
    }
    else if (node.children.length === 1) {
        return first;
    }
    else {
        // todo: better error message and handling
        throw new Error("Not a function");
    }
}

const evalNode = (node) => {
    if (node.type === 'list' && !node.quoted) return evalList(node);
    return valueOf(node);
}

const evalProgram = (ast) => {
    let result;
    for (let child of ast.children) {
        result = evalNode(child);
    }
    return result;
}

export const run = (src) => {
    const ast = parse(src);
    return evalProgram(ast);
}

//console.log(run(`(eval '(+ 3 5))`));

//console.log(run(` (let x 5) (let xsquared (* x x)) (+ xsquared)`));
//console.log(run(`(defun foo () (+ 1 2)) (foo)`));
