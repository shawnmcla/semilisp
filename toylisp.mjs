import { builtinFunctions } from './builtins/builtinFunctions.mjs';
import { ParsingError, RuntimeError, notAFunction, unboundSymbol } from './errors.mjs';
import { makeFunction, param } from './function.mjs';
import { parse } from './parser.mjs';

import { Bool } from "./types/primitiveTypes.mjs";
 
const specialForms = new Map([
    ["do", {
        type: "special",
        name: "do",
        impl: (env, form) => {
            const [_, ...children] = form.children;
            let last;
            for (let child of children) {
                last = valueOf(child);
            }
            return last;
        }
    }
    ], ["if", {
        type: 'special',
        name: 'if',
        impl: (env, form) => {
            const conditionResultObject = valueOf(form.children[1]);
            // TODO: Add validation/sanity checks
            if (conditionResultObject.type !== 'bool') throw new Error("expected bool (TODO)");
            const thenForm = form.children[2];
            const elseForm = form.children[3];
            if (conditionResultObject.value) {
                return valueOf(thenForm);
            }

            if (elseForm)
                return valueOf(elseForm);

            return NIL;
        }
    }],
    ["case", {
        type: 'special',
        name: 'case',
        impl: (env, form) => {
            const branches = form.children.slice(1);
            //if(branches?.type !== 'list') throw new Error("Expected list (TODO)");
            let elseBranch = null;
            for (let branch of branches) {
                const conditionResultObject = valueOf(branch.children[0]);
                // TODO: Add validation/sanity checks
                if (conditionResultObject.type === 'keyword' && conditionResultObject.value === 'else') {
                    elseBranch = branch.children[1];
                }
                else if (conditionResultObject.type !== 'bool') throw new Error("expected bool (TODO)");
                else {
                    const thenForm = branch.children[1];
                    if (conditionResultObject.value) {
                        return valueOf(thenForm);
                    }
                }
            }

            if (elseBranch) {
                return valueOf(elseBranch);
            }

            return NIL;
        }
    }],
    ["eval", {
        type: 'special',
        name: 'eval',
        impl: (env, form) => {
            const toEval = form.children[1];
            if (toEval == null) throw new Error("Expected something TODO");
            const valueToEval = valueOf(toEval);
            if (valueToEval?.type === 'list') return evalList(valueToEval);
            return valueOf(toEval);
        }
    }],
    ["let", {
        type: 'special',
        name: 'let',
        impl: (env, form) => {
            const [_, bindingPair, body] = form.children;
            if (bindingPair?.type !== 'list') throw new Error("Expected list (TODO)");
            if (body?.type !== 'list') throw new Error("Expected list (TODO, code)");
            // TODO: Refine this
            const [symbolObj, valueObj] = bindingPair.children;
            if (symbolObj.type !== 'symbol') throw new Error("Expected symbol");
            enterBlock([
                { symbol: symbolObj.value, value: valueObj }
            ]);
            const returnValue = evalList(form.children[2]);
            exitBlock();
            return returnValue;
        }
    }],
    ["def", {
        type: 'special',
        name: 'def',
        impl: (env, form) => {
            const [_, symbol, value] = form.children;
            if (symbol?.type !== 'symbol') throw new Error("Expected symbol (TODO)");
            const evaluatedValue = valueOf(value);
            runtime.globalEnvironment.boundSymbols.set(symbol.value, evaluatedValue);

            return evaluatedValue;
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
                parameters.children.map(c => param(c.value, 'any')), 'any',
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

            runtime.globalEnvironment.boundSymbols.set(form.children[1].value, func);
            func.environment = copyEnvironment(runtime.currentEnvironment);
            return func;
        }
    }]
]);

const runtime = {
    globalEnvironment: null,
    currentEnvironment: null
};

enterBlock([
    { symbol: "true", value: new Bool(true) },
    { symbol: "false", value: new Bool(false) },
]);

runtime.globalEnvironment = runtime.currentEnvironment;

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

function copyEnvironment(environment) {
    const newEnvironment = makeEnvironment(null);
    let current = environment;
    while (current) {
        for (let [symbol, value] of current.boundSymbols) {
            if (!newEnvironment.boundSymbols.has(symbol)) {
                newEnvironment.boundSymbols.set(symbol, value);
            }
        }
        current = current.parent;
    }

    return newEnvironment;
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

// Obtains the value for an object based on the following:
//   if obj is a symbol, resolve it
//   if obj is an unquoted list (an expression), evaluate it
//   otherwise, return obj as is
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
    // TODO: Remove this FN eventually, for now, just replace body to use new classes
    return obj.coerceObjTo(targetType);
}

const callFunction = (func, ...args) => {
    const _arguments = [];
    let argIndex = 0;

    for (let param of func.parameters) {
        if (param.isRest) {
            for (let i = argIndex; i < args.length; i++) {
                let arg = args[i];
                //arg = convert(arg, param.type);
                _arguments.push(arg);
            }
        }
        else {
            let arg = args[argIndex];
            //arg = convert(args[argIndex], param.type);
            _arguments.push(arg);

            argIndex++;
        }
    }

    // Feels kinda hacky
    const current = runtime.currentEnvironment;
    runtime.currentEnvironment = func.environment;
    const returnValue = func.impl(..._arguments);
    runtime.currentEnvironment = current;

    return returnValue;
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
        notAFunction(first?.stringify());
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
    //console.log(parseResult);
    if (parseResult.hadError) return parseResult;

    return evalProgram(parseResult.result);
}