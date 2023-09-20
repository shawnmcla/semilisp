import { Obj } from "./primitiveTypes.mjs";

export class TypeInfo {
    constructor(){

    }

    stringify(){
        return "Type Info";
    }

    print(){
        return "?"
    }

    isTypeNameMatch(typeName){
        throw new Error("NOT IMPLEMENTED");
    }
}

export class SimpleTypeInfo {
    constructor(typeName){
        this.typeName = typeName;
    }

    isTypeNameMatch(typeName){
        return this.typeName === typeName;
    }

    isCoerceableTypeNameMatch(typeName){
        return this.isTypeNameMatch(typeName) || Obj.typeCanBeCoercedTo(this.typeName, typeName);
    }
}

export class UnionTypeInfo {
    constructor(...typeNames){
        this.typeNames = typeNames;
    }

    isTypeNameMatch(typeName){
        return this.typeNames.includes(typeName);
    }

    isCoerceableTypeNameMatch(typeName){
        let isMatch = this.isTypeNameMatch(typeName);
        if(isMatch) return true;

        for(let thisTypeName of this.typeNames){
            if(Obj.typeCanBeCoercedTo(thisTypeName, typeName))
                return true;
        }

        return false;
    }
}