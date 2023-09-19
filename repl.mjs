import chalk from 'chalk';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline/promises';
import { parse } from './parser.mjs';
import { run } from './shitlisp.mjs';
import { display, dumpAst } from './util/cliTextUtil.mjs';

const rl = readline.createInterface({ input, output, terminal: false });

let exit = false;

console.log("Welcome to the REPL, type 'exit' to quit");

function _getReplInput() {
    return new Promise(async (resolve, reject) => {
        let lines = [];
        let line = await rl.question("> ");
        while (line.trimEnd().endsWith('\\')) {
            line = await rl.question("  ");
            lines.push(line.trimEnd().slice(0, -1));
        }
        lines.push(line);
        resolve(lines.join('\n'));
    });
};

function getReplInput() {
    return new Promise(async (resolve, reject) => {
        let leftParens = 0;
        let rightParens = 0;

        const scanParens = (line) => {
            let i = -1;
            while ((i = line.indexOf('(', i + 1)) !== -1) {
                leftParens++;
            }
            i = -1;
            while ((i = line.indexOf(')', i + 1)) !== -1) {
                rightParens++;
            }
        }

        let lines = [];
        let line = await rl.question("> ");
        scanParens(line);
        while (leftParens > rightParens) {
            lines.push(line);
            line = await rl.question("  ");
            scanParens(line);
        }

        lines.push(line);
        resolve(lines.join('\n'));
    });
};

function displayError(error) {
    console.log(`${chalk.gray(`${error?.constructor.name ?? "Error"}:`)} ${chalk.red(error.message)}`);
}

while (!exit) {
    let input = await getReplInput();
    if (input.toLowerCase() === 'exit') {
        exit = true;
    }
    else if (input.trim() !== '') {
        let details = false;
        if (input.startsWith('?')) {
            details = true;
            input = input.substring(1);
        }

        if (input.startsWith('#dump')) {
            const ast = parse(input.substring(5));
            console.log(dumpAst(ast));
        }

        else {
            const executionResult = run(input);
            if (executionResult.hadError) {
                displayError(executionResult.error);
            } else {
                console.log(display(executionResult.result, details));
            }
        }
    }
}

rl.close();