import chalk from 'chalk';

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
        return `${obj?.quoted ? "'(" : "("}${obj?.children?.map(display).join(' ')})`;
    } else if (obj?.type == 'special') {
        return chalk.gray(`< ${chalk.greenBright(obj?.name)} ${chalk.italic('(special form)')} >`);
    } else if (obj?.type == 'function') {
        if (details) {
            return `<span class="value-function">Function ${chalk.whiteBright.bold(obj?.name)}\n` +
                `Parameters: (\n` +
                `${obj?.parameters?.map(p => `  ${(p?.rest ? '...' : '')}${p?.name} : ${p?.type}`)}\n` +
                `) \n` +
                `Docstring:\n` +
                `  ${obj?.docString}</span>`
        } else {
            return `${chalk.italic.gray('fn')} ${chalk.bold.whiteBright(obj?.name)} (${obj?.parameters.map(p => (p?.rest ? '...' : '') + p.name).join(', ')})`
        }
    }
    return `DON'T KNOW HOW TO DISPLAY TYPE ${obj?.type ?? "null"}`;
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