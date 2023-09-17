export const makeFunction = (name, docString, parameters, returnType, impl, data = {}) => {
    return Object.assign({ type: 'function', name, docString, parameters, returnType, impl }, data);
}