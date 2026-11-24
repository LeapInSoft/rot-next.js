# rot-next.js

**A roguelike toolkit for JavaScript and TypeScript.**

rot-next.js is a modernized fork of [rot.js](https://github.com/ondras/rot.js), the Roguelike Toolkit in JavaScript. Maintained by LeapInSoft, it aims to modernize the codebase, fix bugs, and add thoughtful features while keeping the toolkit approachable for JavaScript and TypeScript developers.

Programming concepts, design, and the craft of building software matter. AI and LLMs are tools to help turn ideas into code more quickly, not substitutes for understanding or programming judgment. The hope is that rot-next.js will be useful to build with and offer something to learn from.

## Library

rot-next.js is written in TypeScript and provides several ways to use the library:

- The package root supports both CommonJS (`require('rot-next.js')`) and ESM (`import ... from 'rot-next.js'`).
- The build's `lib/` directory contains ES modules and TypeScript declarations for modern JavaScript projects and bundlers. Display-specific imports are also available from `rot-next.js/display`; supported TypeScript addons are published from `rot-next.js/addons/...`.
- The `dist/rot.js` bundle can be included in a browser with a traditional `<script>` tag. It exposes the library through the global `ROT` namespace.
- The `dist/rot.min.js` bundle provides the same browser API in a minified file.

For browser examples, see [native modules](./examples/native-modules/), [bundled modules](./examples/bundled-modules/), and [the prebuilt bundle](./examples/dist/).

The map generators are available individually (`Arena`, `Digger`, and others) and through the `Maps` namespace. The legacy `Map` namespace remains as an alias for compatibility; the base generator class is exported as `BaseMap` to avoid confusing it with that namespace.

### Addon architecture

ROT.js already provides reusable roguelike primitives. rot-next.js builds on that foundation and is evolving an additional layer of opt-in addons for higher-level game capabilities.

An addon is intended to provide one focused, reusable behavior—not a complete game template. Addons should work with small, structural TypeScript contracts so developers can use their own item, actor, and game-state types, and compose capabilities without coupling them to a particular game. Where practical, addon operations are functional: they accept data or state and return results, updated state, and typed events or effects. The consuming game decides application-specific policy, such as whether an action advances a turn and how an event is presented.

For example, backpack and equipment addons can provide item storage and configurable equipment-slot transitions for consumer-defined item and state types. The game remains responsible for ground pickup, item effects, inventory policy, turn policy, and user-facing messages. A complete turn-based game is better presented as an example that composes addons with rot-next.js core APIs.

Addons should build on existing core facilities—such as scheduling, map generation, pathfinding, field of view, and random number generation—rather than duplicate them. The core remains a general-purpose roguelike toolkit, not a game framework that imposes a universal player, monster, or entity-component-system model. This addon architecture is an evolving design goal; the published addon APIs are not all aligned with it yet.

### Downloading

- Clone this repository to access the source.
- For a published npm release, install the package with `npm install rot-next.js` (not published yet).
- Or use `dist/rot.js` or `dist/rot.min.js` directly in a browser.

## Node.js

Most of rot-next.js can be used in Node.js. To use `Display` in a terminal, set its `layout` option to `"term"`:

```js
const ROT = require("rot-next.js");

const display = new ROT.Display({ width: 40, height: 9, layout: "term" });
display.draw(5, 4, "@");
display.draw(15, 4, "%", "#0f0");         // foreground color
display.draw(25, 4, "#", "#f00", "#009"); // foreground and background colors
```

See the [Node.js example](./examples/node/) for a runnable example.

## Acknowledgements

rot-next.js builds on the work of **[Ondřej Žára](https://ondras.zarovi.cz/)**, the original author of [rot.js](https://ondras.github.io/rot.js). His toolkit and contributions to the roguelike development community made this project possible and deserve lasting credit.

The project retains the original **BSD-3-Clause** license. See [license.txt](./license.txt) for its terms.

## Further reading

- [Original rot.js project](https://github.com/ondras/rot.js)
- [RogueBasin page for rot.js](http://roguebasin.com/index.php/Rot.js)
