// Compile-time regression guard: test files must be checked with strict null handling.
// @ts-expect-error null must not be assignable to a non-nullable type.
const nullString: string = null;
// @ts-expect-error undefined must not be assignable to a non-nullable type.
const undefinedString: string = undefined;

export {};
