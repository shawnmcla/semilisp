import { parse } from './parser.mjs';
import { stringify, makeNumber, makeString, makeBool, arg } from './util.mjs';
import { mathFunctions } from './builtins/mathFunctions.mjs';
import { stringFunctions } from './builtins/strFunctions.mjs';
import { makeFunction } from './function.mjs';
import { ParsingError, RuntimeError, unboundSymbol } from './errors.mjs';

const builtinFunctions = [...mathFunctions, ...stringFunctions];

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
            const [_, parameters, body] = form.children;
            if (parameters?.type !== 'list') throw new Error("Expected list (TODO)");
            if (body?.type !== 'list') throw new Error("Expected list (TODO, code)");
            // TODO: Refine this
            const [symbolObj, valueObj] = form.children[1].children;
            if (symbolObj.type !== 'symbol') throw new Error("Expected symbol");
            enterBlock([
                { symbol: symbolObj.value, value: valueObj }
            ]);
            const returnValue = evalList(form.children[2]);
            exitBlock();
            return returnValue;
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

            const parameterNames = parameters.children.map(c => c.value);

            const func = makeFunction(
                functionName.value,
                "Custom function", //todo?
                parameters.children.map(c => arg(c.value, 'any')), 'any',
                (...args) => {
                    let nParams = Math.min(parameterNames.length, args.length);
                    const bindings = [];
                    for (let i = 0; i < nParams; i++) {
                        bindings.push({ symbol: parameterNames[i], value: args[i] });
                    }
                    enterBlock(bindings);
                    const returnValue = evalList(form.children[3]);
                    exitBlock();
                    return returnValue;
                }
            );

            runtime.rootEnvironment.boundSymbols.set(form.children[1].value, func);
            return func;
        }
    }]
]);

const runtime = {
    rootEnvironment: null,
    currentEnvironment: null
};

enterBlock([
    { symbol: "true", value: { type: 'bool', value: true } },
    { symbol: "false", value: { type: 'bool', value: false } },
]);
runtime.rootEnvironment = runtime.currentEnvironment;

function makeEnvironment(parent) {
    return {
        parent,
        boundSymbols: new Map()
    };
}

function enterBlock(symbolsAndValues = []) {
    const newEnvironment = makeEnvironment(runtime.currentEnvironment);
    for (let symbolAndValue of symbolsAndValues) {
        newEnvironment.boundSymbols.set(symbolAndValue.symbol, symbolAndValue.value);
    }
    runtime.currentEnvironment = newEnvironment;
}

function exitBlock() {
    if (!runtime.currentEnvironment?.parent) throw new Error("No parent environment. Did you try to exit the root environment?");
    runtime.currentEnvironment = runtime.currentEnvironment.parent;
}

const builtins = new Map();
for (const builtinFunc of builtinFunctions) {
    builtins.set(builtinFunc.name, builtinFunc);
}

const resolve = (symbol) => {
    let env = runtime.currentEnvironment;

    while (env) {
        if (env.boundSymbols.has(symbol)) return env.boundSymbols.get(symbol);
        env = env.parent;
    }

    if (specialForms.has(symbol)) return specialForms.get(symbol);
    if (builtins.has(symbol)) return builtins.get(symbol);

    unboundSymbol(symbol);
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
        return first.impl(runtime, node)
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
        throw new Error("Not a function", node);
    }
}

const evalNode = (node) => {
    if (node.type === 'list' && !node.quoted) return evalList(node);
    return valueOf(node);
}

const evalProgram = (ast) => {
    let result;
    let hadError = false;
    let error = null;

    try {
        for (let child of ast.children) {
            result = evalNode(child);
        }
    } catch (e) {
        if (!(e instanceof RuntimeError)) throw e;
        hadError = true;
        error = e;
    }

    return { result, hadError, error };
}

export const parseProgram = (src) => {
    let result;
    let hadError = false;
    let error = null;

    try {
        result = parse(src);
    } catch (e) {
        if (!(e instanceof ParsingError)) throw e;
        hadError = true;
        error = e;
    }

    return { result, hadError, error };
}

export const run = (src) => {
    const parseResult = parseProgram(src);
    if (parseResult.hadError) return parseResult;

    return evalProgram(parseResult.result);
}

//console.log(run(`(eval '(+ 3 5))`));

//console.log(run(` (let x 5) (let xsquared (* x x)) (+ xsquared)`));
//console.log(run(`(defun foo () (+ 1 2)) (foo)`));

// console.log(run(`
//     (defun fib (n) (
//         if (< n 2) (n) (
//             fib (- n 1) (- n 2)
//         )
//     ))

//     (fib 10)
// `))