import { ioFunctions } from './functions/ioFunctions.mjs';
import { logicFunctions } from './functions/logicFunctions.mjs';
import { mathFunctions } from './functions/mathFunctions.mjs';
import { metaFunctions } from './functions/metaFunctions.mjs';
import { stringFunctions } from './functions/strFunctions.mjs';

export const builtinFunctions = [...mathFunctions, ...stringFunctions, ...ioFunctions, ...logicFunctions, ...metaFunctions];
