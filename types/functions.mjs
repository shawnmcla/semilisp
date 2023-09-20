import { NIL, Obj } from "./primitiveTypes.mjs";

export class Function extends Obj {
    constructor(name, docString, parameters, returnType, impl = () => NIL, data = {}){
        super();
        this.type = "function";
        
        this.name = name;
        this.docString = docString;
        this.parameters = parameters;
        this.returnType = returnType;
        this.impl = impl;
        this.data = data;
    }
}

export class FunctionParameter {
    constructor(name, type, isRest = false) {
        this.name = name;
        this.type = type;
        this.isRest = isRest;
    }
}