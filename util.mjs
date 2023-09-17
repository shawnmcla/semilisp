import chalk from 'chalk';

export const reWhitespace = /\s/, reDigit = /\d/, reAlpha = /[A-Za-z]/, reAlphaNumeric = /[A-Za-z0-9]/, reIdentifier = /[A-Za-z0-9_]/;
export const isWhitespace = c => reWhitespace.test(c);
export const isDigit = c => reDigit.test(c);
export const isValidIdentifierChar = c => reIdentifier.test(c);

export const display = (obj, details = false) => {
    if (obj == null) {
        return chalk.italic.gray('< Nil >');
    } else if (obj?.type == 'number') {
        return chalk.yellow(+obj.value);
    } else if (obj?.type == 'string') {
        return chalk.green(`"${obj?.value?.toString() ?? ""}"`);
    } else if (obj?.type == 'symbol') {
        return chalk.bold.whiteBright(obj?.value?.toString() ?? "");
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
}


export const dumpAst = (ast, level = 0) => {
    let output = "";
    const indent = chalk.blackBright("· ".repeat(level));

    for (let item of ast.children) {
        if (item?.type === 'list') {
            output += `\n${indent}[${dumpAst(item, level + 1)}\n${indent}]`
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