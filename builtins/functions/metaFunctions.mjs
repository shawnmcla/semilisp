import { param, rest, makeFunction } from "../../function.mjs";
import { parse } from "../../parser.mjs";
import { String, NIL} from '../../types/primitiveTypes.mjs';

export const metaFunctions = [
    makeFunction(
        "read", "Parses a string as code",
        [param('string', 'string')], "any",
        (string) => {
            // TODO: Make this less bad
            try {
                const parseResult = parse(string?.value ?? "")?.children[0]
                return parseResult;
            } catch(e){
                return NIL;
            }
        },
    ),
    makeFunction(
        "print", "Stringifies data as code",
        [param('data', 'any')], "string",
        (data) => {
            return new String(data?.print() ?? "");
        },
    ),
]