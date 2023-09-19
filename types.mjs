export const makeNumber = value => ({ type: "number", value: +value });
export const makeString = value => ({ type: "string", value: value?.toString() ?? "" });
export const makeBool = value => ({ type: "bool", value: (!!value) });
export const NIL = { type: 'nil', value: null, };