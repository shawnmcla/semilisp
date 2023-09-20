export const display = (obj, details = false) => {
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
                `${obj?.parameters?.map(p => `  ${(p?.isRest ? '...' : '')}${p?.name} : ${p?.type}`)}<br/>` +
                `) <br/>` +
                `Docstring:<br/>` +
                `  ${obj?.docString}</span>`
        } else {
            return `fn ${obj?.name} (${obj?.parameters.map(p => (p?.isRest ? '...' : '') + p.name).join(', ')})`
        }
    }

    return `DON'T KNOW HOW TO DISPLAY TYPE ${obj?.type ?? "null"}`;
}
