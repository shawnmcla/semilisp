export const makeFunction = (name, docString, parameters, returnType, impl, data = {}) => {
    return Object.assign({ type: 'function', name, docString, parameters, returnType, impl }, data);
}
export const arg = (name, type) => ({ name, type })
export const rest = (name, type) => ({ name, type, rest: true })