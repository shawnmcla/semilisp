const PRIMITIVE_TYPES = [ "number", "bool", "string", "symbol", "keyword" ];
import { escapeString } from "../util.mjs";

export class Obj {
    type;
    value;

    static coerceTable = new Map([
        ["number", ["number", "bool", "string"]],
        ["bool", ["bool", "number", "string"],],
        ["string", ["string", "number", "bool"],],
        ["symbol", ["string"]],
        ["keyword", ["string"]],
    ])

    static make(type, value){
        switch(type){
            case "number":
                return new Number(value);
            case "bool":
                return new Bool(value);
            case "string":
                return new String(value);
            case "symbol":
                return new Symbol(value);
            case "keyword":
                return new Keyword(value);
        }

        throw new Error(`Target type ${type} is not a primitive type`);
    }

    coerceObjTo(targetType){
        return Obj.make(targetType, this.coerceValueTo(targetType));
    }

    print() {
        throw new Error("UNIMPLEMENTED DUMP FOR TYPE " + this.constructor.name);
    }

    stringify() {
        // Default impl
        throw new Error("Unimplemented");
        return this.value?.toString().slice(0, 20) ?? "<?>";
    }

    canBeCoercedTo(typeName){
        if(!this.type || this.type.length == 0) return;
        return Obj.coerceTable.get(this.type)?.includes(typeName);
    }

    static typeCanBeCoercedTo(typeA, typeB){
        return Obj.coerceTable.get(typeA)?.includes(typeB);
    }

    get isPrimitive() { return true };
    get isSequence(){ return false };
}

export class Nil extends Obj {
    static instance = new Nil();
    constructor() {
        super();
        this.type = "nil";
        this.value = null;
    }

    print() {
        return "nil";
    }

    stringify() {
        return "nil";
    }
}

export const NIL = Nil.instance;

export class Bool extends Obj {
    constructor(value = false){
        super();
        this.type = "bool";
        this.value = value;
    }

    coerceValueTo(targetType){
        switch(targetType){
            case "number":
                return (!!this.value) ? 1 : 0;
            case "string":
                return (this.value?.toString());
            case "bool":
                return !!this.value;
        }
    }

    print() {
        return (!!this.value) ? "true" : "false";
    }

    stringify() {
        return (!!this.value) ? "true" : "false";
    }
}

export class Number extends Obj {
    constructor(value = 0){
        super();
        this.type = "number";
        this.value = value;
    }

    print(){
        return ((++this.value).toString());
    }

    stringify() {
        return ((++this.value).toString());
    }

    coerceValueTo(targetType){
        switch(targetType){
            case "number":
                return +this.value;
            case "string":
                return ((+this.value)?.toString());
            case "bool":
                return (+this.value) >= 0;
        }
    }
}

export class String extends Obj {
    constructor(value = ""){
        super();
        this.type = "string";
        this.value = value;
    }

    print(){
        return `"${escapeString(this.value?.toString() ?? "")}"`;
    }

    print(){
        return `"${escapeString(this.value?.toString() ?? "")}"`;
    }

    coerceValueTo(targetType){
        switch(targetType){
            case "number":
                return parseFloat(this.value);
            case "string":
                return this.value;
            case "bool":
                return this.value?.length > 0;
        }
    }
}

export class Symbol extends Obj {
    constructor(value = ""){
        super();
        this.type = "symbol";
        this.value = value;
    }

    print(){
        return this.value?.toString() ?? "";
    }

    stringify(){
        return this.value?.toString() ?? "";
    }

    coerceValueTo(targetType){
        throw new Error("Cannot coerce Symbol");
    }
}

export class Keyword extends Obj {
    constructor(value = ""){
        super();
        this.type = "keyword";
        this.value = value;
    }

    print(){
        return `:${this.value?.toString() ?? ""}`;
    }
    
    stringify(){
        return `:${this.value?.toString() ?? ""}`;
    }
    
    coerceValueTo(targetType){
        throw new Error("Cannot coerce keyword");
    }
}