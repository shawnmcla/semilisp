import { arg, rest, makeFunction } from "../../function.mjs";
import { parse } from "../../parser.mjs";
import { makeNumber, makeBool, NIL } from '../../types.mjs';

export const metaFunctions = [
    makeFunction(
        "read", "Parses a string as code",
        [arg('string', 'string')], "any",
        (string) => {
            // TODO: Make this less bad
            try {
                const parseResult = parse(string?.value ?? "")?.children[0]
                return parseResult;
            } catch(e){
                return NIL;
            }
        },
    )
]