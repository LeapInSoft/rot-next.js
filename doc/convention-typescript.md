# Google TypeScript Style Guide
Source: https://google.github.io/styleguide/tsguide.html

## Source Files

- UTF-8 encoding; only ASCII space (0x20) as whitespace outside literals; escape other whitespace in strings.
- Use named escapes (`\'`, `\"`, `\\`, `\n`, `\t`, ...) over numeric equivalents; no legacy octal escapes; prefer actual Unicode characters, comment non-printable escapes.
- File structure, one blank line between sections: copyright → `@fileoverview` JSDoc → imports → implementation. `@fileoverview` wrapped lines not indented.

## Imports

Four forms:
```ts
import * as foo from '...';   // module/namespace import
import {SomeThing} from '...';// named import
import SomeThing from '...';  // default — ONLY for external code that requires it
import '...';                 // side-effect only
```
- Prefer relative paths (`./foo`) within a project; limit `../../../` chains.
- Prefer named imports for frequently used / clearly named symbols; namespace imports for many symbols from large APIs.
- Fix name collisions by namespace import or renaming the export; renaming imports allowed to avoid collisions or clarify generated/unclear names (`from` → `observableFrom`).
- `import type {...}` may be used when the symbol is only used as a type; use regular imports for values.

## Exports

- **Named exports only** — `export default` forbidden (no canonical name, worse tooling errors).
- Export only what's used outside the module; minimize API surface.
- **No mutable exports** (`export let`); expose a getter instead: `export function getFoo() { return foo; }`
- No container classes of static members for namespacing — export constants/functions directly.
- Use `export type {AnInterface} from './foo';` when re-exporting types (isolatedModules); better still, separate value and type symbols.
- **Use ES modules** — no TypeScript `namespace`, no `require()` / `import x = require(...)` (namespaces only for third-party interop declarations).

## Variables

- `const` by default, `let` if reassigned; **never `var`**; no use before declaration.
- One variable per declaration: `let a = 1, b = 2;` disallowed.

## Arrays & Objects

- Never `Array()` / `new Array(2)`; use literals. For sized arrays: `Array.from<number>({length: 5}).fill(0);`
- No non-numeric properties on arrays — use `Map`/`Object`.
- Spread only spreads matching types: only iterables into arrays, only objects into objects; never spread primitives/`null`/`undefined`; beware spreading class instances (only own enumerable props copy). Bad: `[5, ...(shouldUseFoo && foo)]`.
- Never `new Object()`.
- Destructuring: rest element with no space (`const [a, b, ...rest] = xs;`); skip with commas (`let [, b, , d] = arr;`).
- Parameter destructuring: single level, unquoted shorthand only; defaults on the left side, whole-object default `{}`:
  ```ts
  interface Options {
    num?: number;
    str?: string;
  }
  function destructured({num, str = 'default'}: Options = {}) {}
  // Disallowed: nested patterns, non-trivial whole defaults like = {num: 42}
  ```
- Iterate objects with `Object.keys/values/entries` + `for-of`; unfiltered `for-in` disallowed (filter with `hasOwnProperty` if unavoidable).

## Classes

- No semicolon after class declarations or between methods; one blank line between methods.
- Constructors always called with parens: `new Foo();`. Omit empty constructors that merely delegate — but keep them if they have parameter properties, visibility modifiers, or decorators.
- **No `#private` fields** — use TypeScript `private` (emit size/perf regressions when downleveled).
- Mark never-reassigned properties `readonly` (need not be deeply immutable).
- **Use parameter properties**:
  ```ts
  class Foo {
    constructor(private readonly barService: BarService) {}
  }
  ```
- Initialize fields at their declaration where possible.
- Properties used from templates (Angular etc.) must not be `private` — use `protected`/`public`.
- Getters/setters allowed; getters must be pure; at least one accessor must be non-trivial (no pass-through pairs); never `Object.defineProperty`; name the hidden backing field with `internal`/`wrapped`.
- Computed properties only for symbols; no dict-style keys on classes.
- **Never write `public`** except for non-readonly public parameter properties; limit visibility maximally; prefer module-local functions over private statics.
- No dynamic dispatch of static methods (call on the defining class only); no `this` in static contexts.
- No prototype manipulation (frameworks excepted).
- `toString` overrides must always succeed and have no side effects.

## Functions

- **Prefer function declarations** for named functions; arrow functions OK when an explicit type annotation is needed.
- **Never `function` expressions** — use arrow functions (exceptions: generators, deliberate `this` rebinding which is itself discouraged).
- Arrow bodies: concise body when the return value is used; block body (or `void` prefix) when it isn't:
  ```ts
  const longThings = myValues.filter(v => v.length > 1000);
  myPromise.then(v => { console.log(v); });
  myPromise.then(v => void console.log(v));
  ```
- Don't use `this` in function declarations/expressions unless explicitly rebinding; avoid `.bind(this)` and `const self = this`.
- Avoid arrow functions as class properties in general; they're the right tool when an event handler must be uninstalled (stable reference) — never install handlers with `.bind()`.
- Default parameter initializers: no observable side effects; use sparingly — prefer destructured options objects for many optionals.
- Rest params over `arguments` (never name anything `arguments`); spread over `.apply()`; no space after `...`.
- Generators: `function*`, `yield*`.
- No blank lines at start/end of a function body.

## this
Only in class constructors/methods, functions with an explicit `this` parameter type, or arrow functions in a valid `this` scope. Never the global object, `eval`, or event target.

## Primitives & Coercion

- **Single quotes**; template literal if the string contains `'`; template literals over complex concatenation; no backslash line continuations.
- Number literals: lowercase `0x`/`0o`/`0b`; no other leading zeros.
- Coercion: `String()`, `Boolean()`, `!!`, template strings OK — but never coerce enum values to boolean (compare explicitly).
- Parse numbers with `Number()` + explicit `NaN` check; **no unary `+`**; **no `parseInt`/`parseFloat`** except non-base-10 strings (and validate digits first); use `Math.floor`/`Math.trunc` for integers:
  ```ts
  let f = Number(someString);
  if (isNaN(f)) handleError();
  f = Math.floor(f);
  ```
- In conditionals, use implicit coercion (`if (foo)`) — not `if (!!foo)`.

## Control Structures

- Braces required on all control flow, even one statement (exception: single-line `if (x) x.doFoo();`).
- Assignment inside a condition needs double parens: `while ((x = next())) {...}`
- Prefer `for-of` for arrays; `forEach`/plain `for` allowed; `for-in` never on arrays.
- No unnecessary parens after `delete`, `typeof`, `void`, `return`, `throw`, `case`, `in`, `of`, `yield`.
- **Switch**: `default` group required (even empty) and last; non-empty groups must end with `break`/`return`/`throw`; only empty groups may fall through.
- **Equality**: always `===`/`!==`; exception: `x == null` to match both null and undefined.
- Keep `try` blocks focused — move non-throwing code out.

## Exceptions

- Always `throw new Error(...)` (with `new`); throw only `Error` subclasses; prefer exceptions to error containers/return codes.
- Catch as `unknown` and assume/assert `Error`:
  ```ts
  function assertIsError(e: unknown): asserts e is Error {
    if (!(e instanceof Error)) throw new Error('e is not an Error');
  }
  try {
    doSomething();
  } catch (e: unknown) {
    assertIsError(e);
    displayError(e.message);
  }
  ```
- In tests, don't use `try { shouldFail(); fail('expected error'); } catch {}` — the `fail()` error is itself caught; use `assertThrows()`.
- Don't defensively handle non-Error throws unless a known-bad API requires it (comment the source).
- Empty catch blocks need a justifying comment.

## Type Assertions & any

- Type assertions (`x as T`) and non-null assertions (`y!`) are unsafe — they only silence the compiler, with no runtime check. Prefer runtime checks; comment when genuinely needed:
  ```ts
  // Good
  if (x instanceof Foo) { x.foo(); }
  if (y) { y.bar(); }
  // Avoid
  (x as Foo).foo();
  y!.bar();
  ```
- Use `as` syntax, never angle brackets; parenthesize member access: `(z as Foo).length`.
- Double assertion through `unknown` when necessary: `(x as unknown as Foo)`.
- Object literals: use type **annotations** (`const x: Foo = {...}`), not `as Foo` (catches refactoring bugs).
- **Avoid `any`** — it masks errors and undermines static typing. Prefer, in order:
  1. A specific type — interface, inline object type, type alias, or generic:
     ```ts
     interface MyUserJson { name: string; email: string; }
     type MyType = number|string;
     function getTwoThings(): {something: number, other: string} { ... }
     function nicestElement<T>(items: T[]): T { ... }
     ```
  2. `unknown` — assignable from anything but must be narrowed before use.
  3. A lint suppression with an explanatory comment:
     ```ts
     // This test only needs a partial BookService implementation.
     // tslint:disable-next-line:no-any
     const mockBookService = ({get() { return mockBook; }} as any) as BookService;
     ```
- `{}` type (any non-nullish value): avoid; use `unknown` (opaque, includes null/undefined), `Record<string, T>` (dictionaries), or `object` (excludes primitives).

## Type System

- Rely on inference for trivial types — `const x = true;` not `const x: boolean = true;`; do specify generics with no inferable values: `new Set<string>()`; annotate complex expressions for readability.
- Return type annotations are the author's choice; reviewers may request them for complex types.
- **null vs undefined**: type aliases must not include `|null`/`|undefined` — add them at the use site. Prefer optional `field?: T` / `param?: T` over `|undefined`.
- Structural typing: annotate declarations with the intended interface so errors surface at the declaration, not call sites; use interfaces (not classes) for structural types.
- **Prefer `interface` over type-literal aliases** for object shapes.
- Array syntax: `T[]` / `readonly T[]` / `T[][]` for simple types; `Array<T>` for complex element types:
  ```ts
  let a: string[];               // good
  let f: Array<string|number>;   // good
  let bad: Array<string>;        // disallowed
  let bad2: (string|number)[];   // disallowed
  ```
- Index signatures: label the key meaningfully — `{[userName: string]: number}`; prefer `Map`/`Set`; `Record<K, V>` for fixed key sets.
- Mapped/conditional types: allowed but prefer the simplest construct; verbosity beats cleverness (e.g. an explicit interface over `Pick<T, K>` when clearer).
- Tuples over `Pair`-style interfaces; inline object types when names help:
  ```ts
  function splitInHalf(input: string): [string, string] { ... }
  function splitHostPort(address: string): {host: string, port: number} { ... }
  ```
- **Never** wrapper types `String`/`Boolean`/`Number`/`Object` — use `string`/`boolean`/`number`/`object`/`{}`.
- Avoid return-type-only generics; always specify generics explicitly when calling such APIs.

## Disallowed Features

- `const enum` (use plain `enum`); `debugger;` in production; `with`; `eval` / `Function(string)`; wrapper constructors; relying on ASI (semicolons required); modifying builtins/globals; non-standard or removed language features (runtime-specific APIs OK when targeted).

## Decorators
Only framework-provided decorators (Angular `@Component`/`@NgModule`/`@Input`, Polymer `@property`...); never define new ones; the decorator immediately precedes its symbol, no blank lines between (JSDoc above the decorator):
```ts
/** JSDoc before decorator. */
@Component({...})
class MyComp {
  @Input() myField: string;
}
```

## Naming

| Style | Used for |
|---|---|
| `UpperCamelCase` | classes, interfaces, types, enums, decorators, type parameters, TSX component functions |
| `lowerCamelCase` | variables, parameters, functions, methods, properties, module aliases |
| `CONSTANT_CASE` | global constants and enum values (intended immutability) |
| `#ident` | never used |

- No trailing/leading underscores for privates; no `opt_` prefixes; `_` never an identifier (skip destructured elements with commas).
- No `I`-prefix / `Interface`-suffix on interfaces; `$` only where a framework requires it (Observables `foo$` is an accepted convention — be consistent).
- Names must be descriptive; no letter-deleting abbreviations; single letters OK in scopes ≤10 lines.
- Treat acronyms as words: `loadHttpUrl`, not `loadHTTPURL` (platform names like `XMLHttpRequest` excepted).
- Type parameters: `T` or `UpperCamelCase`.
- Test methods may use `_`: `testX_whenY_doesZ()`.
- Files are `snake_case`; module imports `lowerCamelCase`: `import * as fooBar from './foo_bar';` (jQuery `$`, `THREE` excepted).
- Constants: module-level, static readonly, or enum values in `CONSTANT_CASE`; locals and nested statics use `lowerCamelCase`.
- Aliases keep the original's format; use `const` (variables) or `readonly` (fields).

## Comments & Documentation

- JSDoc `/** ... */` for user-facing documentation (tool-readable); `//` for implementation notes.
- Multi-line implementation comments: multiple `//` lines, not `/* */`; no ASCII-art boxes.
- JSDoc is Markdown; use Markdown lists; each tag on its own line:
  ```ts
  /**
   * Computes weight based on three factors:
   * - items sent
   * - items received
   * @param left Left param description.
   */
  ```
- Only the Google-allowed subset of JSDoc tags.

## Quick Reference
- Named exports only; ES modules; no namespaces
- `const`/`let`; semicolons; single quotes; `===`
- Parameter properties + `readonly`; no `#private`; no `public` keyword
- Function declarations for named fns; arrows for callbacks
- `interface` over type alias; `T[]` for simple arrays; `unknown` over `any`
- `UpperCamelCase` / `lowerCamelCase` / `CONSTANT_CASE`; `snake_case` files
