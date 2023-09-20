const PRIMITIVE_TYPES = [ "number", "bool", "string" ];

export class Obj {
    type;
    value;

    static make(type, value){
        switch(type){
            case "number":
                return new Number(value);
            case "bool":
                return new Bool(value);
            case "string":
                return new String(value);
        }

        throw new Error(`Target type ${type} is not a primitive type`);
    }

    coerceObjTo(targetType){
        return Obj.make(targetType, this.coerceValueTo(targetType));
    }

    get isPrimitive() { return true };
    get isSequence(){ return false };
}

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
}

export class Number extends Obj {
    constructor(value = 0){
        super();
        this.type = "number";
        this.value = value;
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