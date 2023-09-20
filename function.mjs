import { Function, FunctionParameter } from "./types/functions.mjs";

export const makeFunction = (name, docString, parameters, returnType, impl, data = {}) => {
   return new Function(name, docString, parameters, returnType, impl);
}

export const param = (name, type) => new FunctionParameter(name, type); //({ name, type })
export const rest = (name, type) => new FunctionParameter(name, type, true);