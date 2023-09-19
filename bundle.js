class ParsingError extends Error { }

class RuntimeError extends Error { }
class UnboundSymbolError extends RuntimeError { }

const unboundSymbol = (symbol, sourceInfo = null) => {
    const errorMessage = `Unbound symbol '${symbol}'${sourceInfo ? `" at line ${sourceInfo.line}, col ${sourceInfo.col}` : ''}`;
    throw new UnboundSymbolError(errorMessage);
};

const unexpectedCharacter = (character, sourceInfo = null) => {
    const errorMessage = `Unexpected character '${character}'${sourceInfo ? `" at line ${sourceInfo.line}, col ${sourceInfo.col}` : ''}`;
    throw new ParsingError(errorMessage);
};

const unterminatedString = (sourceInfo = null) => {
    const errorMessage = `Unterminated string literal ${sourceInfo ? `at line ${sourceInfo.line}, col ${sourceInfo.col}` : ''}`;
    throw new ParsingError(errorMessage);
};

const invalidEscapeChar = (character, sourceInfo = null) => {
    const errorMessage = `Unexpected escape character '${character}'${sourceInfo ? `" at line ${sourceInfo.line}, col ${sourceInfo.col}` : ''}`;
    throw new ParsingError(errorMessage);
};

const reWhitespace = /\s/, reDigit = /\d/;
const isWhitespace = c => reWhitespace.test(c);
const isDigit = c => reDigit.test(c);

const parse = (src) => {
    let i = 0;

    let line = 1;
    let lastNewLine = 1;

    const root = { type: "list", prev: null, children: [], root: true };
    let current = root;

    const beginList = (quoted = false) => {
        const tree = { type: "list", prev: current, children: [], start: i - 1, quoted, sourceLine: line, sourceCol: i - lastNewLine };
        current.children.push(tree);
        current = tree;
    };

    const endList = () => {
        if (!current) unexpectedCharacter(src[i - 1]);
        current.end = i;
        current.src = src.substring(current.start - (current.quoted ? 1 : 0), current.end);
        current = current.prev;
    };

    const advance = () => src[i++];

    const peek = () => src[i];
    const peekNext = () => src[i + 1];

    const isAtEnd = () => i >= src.length;

    const emitNumber = (lexeme) => ({ type: "number", lexeme, value: parseFloat(lexeme) });
    const emitString = (lexeme) => ({ type: "string", lexeme, value: lexeme.substring(1, lexeme.length - 1) });
    const emitSymbol = (lexeme) => ({ type: "symbol", lexeme, value: lexeme });
    const emitKeyword = (lexeme) => ({ type: "keyword", lexeme, value: lexeme });

    while (!isAtEnd()) {
        let c = advance();
        if (isWhitespace(c)) {
            if (c === '\n') {
                line++;
                lastNewLine = i;
            }
            continue;
        }

        if (c === '(') {
            beginList();
        }

        else if (c === ')') {
            endList();
        }

        else if (c === "'" && peek() === '(') {
            advance();
            beginList(true);
        }

        else if (isDigit(c) || c === '-' && isDigit(peek())) {
            let start = i - 1;
            // TODO: Do not allow multiple points in numeric values :)
            while (!isAtEnd() && isDigit(peek()) || peek() == '.') advance();
            current.children.push(emitNumber(src.substring(start, i)));
        }

        else if (c === '"') {
            const stringParts = [c];
            while (true) {
                const peeked = peek();
                if (isAtEnd()) {
                    unterminatedString();
                }
                else if (peeked === '"') {
                    break;
                }
                else if (peeked === '\\') {
                    let next = peekNext();
                    switch (next) {
                        case '\\':
                            stringParts.push('\\');
                            break;
                        case 'n':
                            stringParts.push('\n');
                            break;
                        case 't':
                            stringParts.push('\t');
                            break;
                        case '"':
                            stringParts.push('"');
                            break;
                        default:
                            invalidEscapeChar(next);
                    }
                    advance();
                    advance();
                }
                else {
                    stringParts.push(peeked);
                    advance();
                }
            }
            stringParts.push(advance());
            current.children.push(emitString(stringParts.join('')));
        }
        else if(c === ':' &&  /[^\s\(\)]/.test(peek())) {
            let start = i - 1;
            while (!isAtEnd() && /[^\s\(\)]/.test(peek())) advance();
            current.children.push(emitKeyword(src.substring(start, i)));
        }
        else {
            let start = i - 1;
            while (!isAtEnd() && /[^\s\(\)]/.test(peek())) advance();
            current.children.push(emitSymbol(src.substring(start, i)));
        }
    }

    return root;
};

const makeNumber = value => ({ type: "number", value: +value });
const makeString = value => ({ type: "string", value: value?.toString() ?? "" });
const makeBool = value => ({ type: "bool", value: (!!value) });
const NIL = { type: 'nil', value: null, };

const makeFunction = (name, docString, parameters, returnType, impl, data = {}) => {
    return Object.assign({ type: 'function', name, docString, parameters, returnType, impl }, data);
};
const arg = (name, type) => ({ name, type });
const rest = (name, type) => ({ name, type, rest: true });

const mathFunctions = [
    // Arithmetic
    makeFunction(
        "+", "Performs addition of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => makeNumber(operands.slice(1).reduce((prev, cur) => (prev) + cur.value, operands[0].value)),
    ),
    makeFunction(
        "-", "Performs subtraction of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => makeNumber(operands.slice(1).reduce((prev, cur) => (prev) - cur.value, operands[0].value)),
    ),
    makeFunction(
        "*", "Performs multiplication of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => makeNumber(operands.slice(1).reduce((prev, cur) => (prev) * cur.value, operands[0].value)),
    ),
    makeFunction(
        "/", "Performs division of arbitrary amount of number arguments",
        [rest('operands', 'number')], "number",
        (...operands) => makeNumber(operands.slice(1).reduce((prev, cur) => (prev) / cur.value, operands[0].value)),
    ),
    makeFunction(
        "//", "Performs integer division of two numeric values (truncating any decimals from the result)",
        [arg('x', 'number'), arg('y', 'number')], "number",
        (x, y) => makeNumber(Math.floor(x?.value / y?.value)),
    ),
    makeFunction(
        "%", "Returns the result of x modulo y",
        [arg('x', 'number'), arg('y', 'number')], "number",
        (x, y) => makeNumber(x?.value % y?.value),
    ),

    makeFunction(
        "pow", "Raises the base value to the power specified",
        [arg('base', 'number'), arg('power', 'number')], "number",
        (base, power) => makeNumber(Math.pow(base.value, power.value))
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

    
];

const stringFunctions = [
    makeFunction(
        "str-cat", "Concats an arbitrary number of strings together",
        [rest('operands', 'string')], "string",
        (...operands) => makeString(operands.map(o => o?.value?.toString() ?? "").join(''))
    ),
    makeFunction(
        "str-lower", "Converts a string to lowercase",
        [arg('string', 'string')], "string",
        (string) => makeString(string?.value?.toLowerCase())
    ),
    makeFunction(
        "str-upper", "Converts a string to uppercase",
        [arg('string', 'string')], "string",
        (string) => makeString(string?.value?.toUpperCase())
    ),
    makeFunction(
        "str-repeat", "Repeats a string the specified number of times",
        [arg('string', 'string'), arg('times', 'number')], "string",
        (string, times) => makeString(string?.value?.repeat(times?.value))
    ),
    makeFunction(
        "str-len", "Returns the length of a string",
        [arg('string', 'string')], "number",
        (string) => makeNumber(string?.value?.length ?? 0)
    ),

];

const ioFunctions = [
    // Stdout
    makeFunction(
        "io-print", "Outputs the provided string to the standard output",
        [arg('string', 'string')], "nil",
        // TODO: Configurable stdout stream
        (string) => (console.log(string?.value.toString() ?? ""), NIL),
    ),
    makeFunction(
        // TODO - support this
        "io-println", "Outputs the provided string to the standard output, appending a new line at the end",
        [arg('string', 'string')], "nil",
        // TODO: Configurable stdout stream
        (string) => (console.log((string?.value.toString() ?? "") + "\n"), NIL),
    ),
];

const logicFunctions = [
    // Arithmetic
    makeFunction(
        "and", "Performs a logical and on all provided operands",
        [rest('operands', 'bool')], "bool",
        (...operands) => {
            console.log(operands);
            console.log(operands.map(o => o.value).join(" AND "));
            const reduced = operands.slice(1).reduce((prev, cur) => prev && cur.value, operands[0].value);
            console.log("Reduced to", reduced);
            return makeBool(reduced);
        },
    ),
    makeFunction(
        "or", "Performs a logical or on all provided operands",
        [rest('operands', 'bool')], "bool",
        (...operands) => makeBool(operands.slice(1).reduce((prev, cur) => prev || cur.value, operands[0].value)),
    ),

    
];

const metaFunctions = [
    makeFunction(
        "read", "Parses a string as code",
        [arg('string', 'string')], "any",
        (string) => {
            // TODO: Make this less bad
            try {
                const parseResult = parse(string?.value ?? "")?.children[0];
                return parseResult;
            } catch(e){
                return NIL;
            }
        },
    )
];

const builtinFunctions = [...mathFunctions, ...stringFunctions, ...ioFunctions, ...logicFunctions, ...metaFunctions];

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
                if (conditionResultObject.type === 'keyword' && conditionResultObject.value === ':else') {
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
            if (toEval?.type === 'list') return evalList(toEval);
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
    { symbol: "true", value: { type: 'bool', value: true } },
    { symbol: "false", value: { type: 'bool', value: false } },
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

    console.log("Made new environment ", newEnvironment);
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
};

const valueOf = (obj) => {
    if (obj.type === 'symbol') {
        return resolve(obj.value);
    }
    else if (obj.type === 'list' && !obj.quoted) {
        return evalList(obj);
    }
    else return obj;
};

const convert = (obj, targetType) => {
    if (targetType === 'any' || obj.type === targetType) return obj;

    if (targetType === 'bool') {
        let boolValue;

        if (obj.type === 'number') boolValue = obj.value > 0;
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


};

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

    // Feels kinda hacky
    const current = runtime.currentEnvironment;
    runtime.currentEnvironment = func.environment;
    const returnValue = func.impl(..._arguments);
    runtime.currentEnvironment = current;

    return returnValue;
};

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
};

const evalNode = (node) => {
    if (node.type === 'list' && !node.quoted) return evalList(node);
    return valueOf(node);
};

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
};

const parseProgram = (src) => {
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
};

const run = (src) => {
    console.debug("RUN..", src);
    const parseResult = parseProgram(src);
    console.debug("PARSE RESULT", parseResult);
    if (parseResult.hadError) return parseResult;

    return evalProgram(parseResult.result);
};

const display = (obj, details = false) => {
    if (obj == null || obj.type === 'nil') {
        return '<span class="value-nil">&lt;Nil&gt;</span>';
    } else if (obj?.type == 'number') {
        return `<span title="number" class="value-number">${(+obj.value)}</span>`;
    } else if (obj?.type == 'string') {
        return `<span title="string"class="value-string">${(obj?.value?.toString()) ?? ""}</span>`;
    } else if (obj?.type == 'bool') {
        return `<span title="bool" class="value-bool">${obj?.value?.toString()}</span>`;
    } else if (obj?.type == 'symbol') {
        return `<span title="symbol" class="value-symbol">${obj?.value?.toString() ?? ""}</span>`;
    } else if (obj?.type == 'keyword') {
        return `<span title="keyword" class="value-keyword">${obj?.value?.toString() ?? ""}</span>`;
    } else if (obj?.type == 'list') {
        return `<span class="value-list">${obj?.quoted ? "'(" : "("}${obj?.children?.map(display).join(' ')})</span>`;
    } else if (obj?.type == 'special') {
        return `<span class="value-special">&lt; ${obj?.name} (special form &gt;`;
    } else if (obj?.type == 'function') {
        if (details) {
            return `<span class="value-function">Function ${obj?.name}<br/>` +
                `Parameters: (<br/>` +
                `${obj?.parameters?.map(p => `  ${(p?.rest ? '...' : '')}${p?.name} : ${p?.type}`)}<br/>` +
                `) <br/>` +
                `Docstring:<br/>` +
                `  ${obj?.docString}</span>`
        } else {
            return `fn ${obj?.name} (${obj?.parameters.map(p => (p?.rest ? '...' : '') + p.name).join(', ')})`
        }
    }

    return `DON'T KNOW HOW TO DISPLAY TYPE ${obj?.type ?? "null"}`;
};

const consoleWrapper = document.querySelector(".console");
const inputArea = document.querySelector(".input-area");
const input = document.querySelector("#repl-input");
const output = document.querySelector(".output");
const MAX_HISTORY_LINES = 100;

consoleWrapper.addEventListener("click", () => {
    input.focus();
});

const history = {
    lines: [],
    index: null,
    get length() {
        return this.lines.length;
    },
    up() {
        if(this.length === 0) {
            return null;
        }

        if(this.index === null) {
            this.index = this.length - 1;
        }

        else if(this.index <= 0) {
            return null;
        } 
        else {
            this.index--;
        }

        return this.lines[this.index];
    },
    down() {
        if(this.length === 0 || this.index === null) {
            return null;
        }
        else if(this.index == this.length - 1) {
            return null;
        } 
        else {
            this.index++;
        }

        return this.lines[this.index];
    },
    push(line) {
        if(this.lines[this.index] === line) return;
        this.lines.push(line);
        this.index = null;
        if(this.length > MAX_HISTORY_LINES){
            const toRemove = this.length - MAX_HISTORY_LINES;
            this.lines = this.lines.slice(toRemove - 1);
        }
        localStorage.setItem("history", JSON.stringify(this.lines));
    },
    loadFromStorage() {
        const savedHistory = localStorage.getItem("history");
        if(!savedHistory) return;
        try {
            const parsedHistory = JSON.parse(savedHistory);
            if(parsedHistory && Array.isArray(parsedHistory)){
                this.lines = parsedHistory;
            }
        } catch(e) {
            console.error("Error deserializing saved history, discarding");
            localStorage.setItem("history", "[]");
        }
    }
};

history.loadFromStorage();

function printOutput(content, classes = []) {
    const div = document.createElement("div");
    div.classList.add("output-line", ...classes);
    div.innerHTML = content;
    output.appendChild(div);
}

function error(error) {
    return `<span class='error'>${error.message}</span>`;
}

function runCode(src){
    try {
        const result = run(src);
        if(result.hadError){
            printOutput(error(result.error));
        } else {
            const output = result.result;
            console.log(output);
            printOutput(display(output), ["result"]);
        }
    } catch(e){
        console.error(e);
        printOutput(`<span style="color: red">Uh oh, spaghetti-Os</span>`);
    }
}

let leftBraces = 0;
let rightBraces = 0;
let lineBuffer = [];

function handleMetaCommand(command) {
    console.log("Meta command: ", command);
    switch(command.substring(1)){
        case "clear":
            output.innerHTML = "";
            break;
        case "clearhistory":
            history.lines = [];
            localStorage.setItem("history", "[]");
    }

    input.value = "";
}

function onInput(text) {
    if(text.startsWith("#")){
        handleMetaCommand(text);
        return;
    }
    for(let c of text) {
        if(c === '(') leftBraces++;
        else if(c === ')') rightBraces++;
    }

    history.push(text);
    lineBuffer.push(text);
    printOutput(text, [lineBuffer.length === 1 ? "echo" : "follow-up"]);
    input.value = "";
    inputArea.classList.add("follow-up");
    if(rightBraces >= leftBraces) {
        const allText = lineBuffer.join('\n');
        leftBraces = 0;
        rightBraces = 0;
        lineBuffer.length = 0;
        inputArea.classList.remove("follow-up");
        runCode(allText);
    }
}

input.addEventListener("keydown", (e) => {
    if(e.key == "Enter") {
        const text = input.value;
        if(text.length === 0) return;
        onInput(text);
    }

    else if(e.key == "ArrowUp") {
        const historyValue = history.up();
        if(historyValue !== null) {
            input.focus();
            input.value = historyValue;
        }
    }

    else if(e.key == "ArrowDown") {
        const historyValue = history.down();
        if(historyValue !== null) {
            input.focus();
            input.value = historyValue;
        }
    }
});
