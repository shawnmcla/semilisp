import { parse } from "./parser.mjs";
import { run } from "./toylisp.mjs";
import { display } from "./util/webTextUtil.mjs";

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
}

history.loadFromStorage();

function outputLineClickHandler(e) {
    const text = e.target.innerText;
    input.value = text.trim();
}

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
const samples = new Map([
    ["fib", "(defun fib (n) (if (< n 2) 1 (+ (fib (- n 1)) (fib (- n 2)))))"],
    ["math", "(+ (pow 10 2) (* 5 5))"],
    ["string", `(str-cat (str-repeat "Hello! " 5) (str-repeat (str-upper "World") 5)))`],
    ["eval", `(eval (read "'(+ 1 2 3 4 5)"))`]
])
function handleMetaCommand(command) {
    console.log("Meta command: ", command);
    const tokens = command.substring(1).split(" ");
    switch(tokens[0]){
        case "clear":
            output.innerHTML = "";
            break;
        case "sample":
            if(samples.has(tokens[1])){
                input.value = samples.get(tokens[1]);
                return;
            } else {
                printOutput("Usage: #sample [sample name]");
                printOutput("Available samples:");
                for(let sampleName of samples.keys()){
                    printOutput(sampleName);
                }
            }
            break;
        case "clearhistory":
            history.lines = [];
            localStorage.setItem("history", "[]");
        default:
            break;
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
    lineBuffer.push(text)
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