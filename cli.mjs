import { readFile } from 'node:fs/promises';
import { run } from "./toylisp.mjs";
import { display } from "./util/cliTextUtil.mjs";

let filePath;
if (filePath = process.argv[2]) {
    console.log(`Loading file '${filePath}'\n`);
    try {
        const contents = await readFile(filePath, { encoding: 'utf-8' });
        const runResult = run(contents);
        if (runResult.hadError) {
            console.error("Error: ", runResult.error.message);
        } else {
            console.log(display(runResult.result));
        }

    } catch (err) {
        console.error(err.message);
    }
}

