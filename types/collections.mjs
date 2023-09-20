import { Obj, Number, Bool, String } from "./primitiveTypes";

export class SequenceType extends Obj {
    get isPrimitive() { return false };
    get isSequence(){ return true };

    constructor(){
        super();
    }

    get length() { throw new Error("Not implemented"); }
}

export class List extends SequenceType {
    children;

    constructor(...children){
        super();
        this.children = children;
    }

    get length() { return this.children.length; }
}