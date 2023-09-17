import chalk from 'chalk';

export const reWhitespace = /\s/, reDigit = /\d/, reAlpha = /[A-Za-z]/, reAlphaNumeric = /[A-Za-z0-9]/, reIdentifier = /[A-Za-z0-9_]/;
export const isWhitespace = c => reWhitespace.test(c);
export const isDigit = c => reDigit.test(c);
export const isValidIdentifierChar = c => reIdentifier.test(c);
export const NIL = { type: 'nil', value: null, };

export const escapeString = (str) => {
    return str
        .replaceAll('\\', '\\\\')
        .replaceAll('"', '\\"')
        .replaceAll('\t', '\\t')
        .replaceAll('\n', '\\n');
}

export const display = (obj, details = false) => {
    if (obj == null || obj.type === 'nil') {
        return chalk.italic.gray('<Nil>');
    } else if (obj?.type == 'number') {
        return chalk.yellow(+obj.value);
    } else if (obj?.type == 'string') {
        return chalk.green(`"${(obj?.value?.toString()) ?? ""}"`);
    } else if (obj?.type == 'bool') {
        return chalk.cyan(obj?.value?.toString());
    } else if (obj?.type == 'symbol') {
        return chalk.bold.whiteBright(obj?.value?.toString() ?? "");
    } else if (obj?.type == 'keyword') {
        return chalk.bold.magenta(obj?.value?.toString() ?? "");
    } else if (obj?.type == 'list') {
        return `${obj?.quoted ? "'(" : "("}${obj?.children?.map(display).join(', ')})`;
    } else if (obj?.type == 'special') {
        return chalk.gray(`< ${chalk.greenBright(obj?.name)} ${chalk.italic('(special form)')} >`);
    } else if (obj?.type == 'function') {
        if (details) {
            return `Function ${chalk.whiteBright.bold(obj?.name)}\n` +
                `Parameters: (\n` +
                `${obj?.parameters?.map(p => `  ${(p?.rest ? '...' : '')}${p?.name} : ${p?.type}`)}\n` +
                `) \n` +
                `Docstring:\n` +
                `  ${obj?.docString}`
        } else {
            return `${chalk.italic.gray('fn')} ${chalk.bold.whiteBright(obj?.name)} (${obj?.parameters.map(p => (p?.rest ? '...' : '') + p.name).join(', ')})`
        }
    }
    return `DON'T KNOW HOW TO DISPLAY TYPE ${obj?.type ?? "null"}`;
}

const printNode = (node) => {
    switch (node.type) {
        case 'list':
            return `${node.quoted ? "'(" : "("}${node.children.map(print).join(" ")})`
        case 'number':
            return `${node.value}`;
        case 'bool':
            return node.value.toString();
        case 'symbol':
        case 'keyword':
            return node.value;
        case 'string':
            return `"${escapeString(node.value)}"`;
        default:
            throw new Error("Invalid node type", node);
    }
}

export const print = (node) => {
    if (!node) return "";
    if (node.root === true) {
        const representations = [];
        for (let child of node.children) {
            representations.push(printNode(child));
        }
        return representations.join("\n");
    }
    return printNode(node);
}

export const dumpAst = (ast, level = 0) => {
    let output = "";
    const indent = chalk.blackBright("· ".repeat(level));

    for (let item of ast.children) {
        if (item?.type === 'list') {
            const sourceInfo = (" ".repeat(20 - (level * 2))) + chalk.gray(`line ${item.sourceLine}, col ${item.sourceCol}`);
            output += `\n${indent}[${sourceInfo}${dumpAst(item, level + 1)}\n${indent}]`;
        } else {
            output += `\n${indent}${chalk.gray(chalk.italic(item.type) + "(")}${display(item)}${chalk.gray(')')}`;
        }
    }

    return output;
}

export const stringify = (obj) => {
    switch (obj?.type) {
        case "symbol":
        case "number":
        case "string":
            return obj.value;
        case "list":
            return `[${obj.children.map(stringify).join(", ")}]`;
        default:
            return `{ ${obj?.type ?? "unknown"}(${obj?.value}) }`
    }
}

export const makeNumber = value => ({ type: "number", value: +value });
export const makeString = value => ({ type: "string", value: value?.toString() ?? "" });
export const makeBool = value => ({ type: "bool", value: !!value });

export const arg = (name, type) => ({ name, type })
export const rest = (name, type) => ({ name, type, rest: true })