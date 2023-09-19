export const reWhitespace = /\s/, reDigit = /\d/, reAlpha = /[A-Za-z]/, reAlphaNumeric = /[A-Za-z0-9]/, reIdentifier = /[A-Za-z0-9_]/;
export const isWhitespace = c => reWhitespace.test(c);
export const isDigit = c => reDigit.test(c);
export const isValidIdentifierChar = c => reIdentifier.test(c);

export const escapeString = (str) => {
    return str
        .replaceAll('\\', '\\\\')
        .replaceAll('"', '\\"')
        .replaceAll('\t', '\\t')
        .replaceAll('\n', '\\n');
}

const printNode = (node) => {
    switch (node.type) {
        case 'list':
            return `${node.quoted ? "'(" : "("}${node.children.map(printNode).join(" ")})`
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

export const stringify = (obj) => {
    switch (obj?.type) {
        case "symbol":
        case "number":
        case "string":
            return obj.value;
        case "list":
            return `[${obj.children.map(stringify).join(" ")}]`;
        default:
            return `{ ${obj?.type ?? "unknown"}(${obj?.value}) }`
    }
}

