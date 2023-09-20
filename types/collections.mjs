import { Obj, Number, Bool, String } from "./primitiveTypes.mjs";

export class SequenceType extends Obj {
    get isPrimitive() { return false };
    get isSequence(){ return true };

    constructor(){
        super();
    }

    get length() { throw new Error("Not implemented"); }

    stringify(){
        // TODO
        return "Sequence<>";
    }

    print() {
        return "Sequence<>";
    }
}

export class List extends SequenceType {
    children;

    constructor(children=[]){
        super();
        this.type = "list";
        this.children = children;
    }

    print() {
        return `${this.quoted ? "'(" : "("}${this.children.map(c => c.print()).join(" ")})`;
    }

    get length() { return this.children.length; }
}

export class ParserList extends List {
    constructor(prev = null, root = false, children=[], quoted = false, sourceInfo = {} ){
        super(children, quoted);
        this.quoted = quoted;
        this.prev = prev;
        this.root = root;
        this.sourceInfo = sourceInfo;
    }
}
