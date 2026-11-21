# Examples

The examples in this directory demonstrate the supported ways to consume
`rot-next.js`. They render the same basic 11x5 room and `@` player marker.

Examples are demonstrations, not maintained application templates or addon
packages. Use the public package entry points below instead of imports from
`src/` or generated implementation files.

## Setup

Requirements:

- Node.js and npm
- A local HTTP server for the browser examples

From the repository root, install dependencies and build the library:

```sh
npm install
npm run build
```

The build creates `lib/` ES modules and the `dist/rot.js` and
`dist/rot.min.js` browser bundles.

To serve the browser examples on Node.js:

```sh
npm run examples:serve
```

Then open one of the URLs listed below. Stop the server with `Ctrl+C`.

## Node.js CommonJS entry point

[`node/example.js`](node/example.js) loads the package through
`require("../..")` and uses the terminal display layout.

Run it from the repository root:

```sh
node examples/node/example.js
```

This entry point uses the package's published `main` field and does not import
library implementation files.

## Browser native ES modules

[`native-modules/index.html`](native-modules/index.html) imports
`lib/index.js` directly through a native ES module script.

Open:

```text
http://localhost:8080/examples/native-modules/
```

Native modules require `npm run build` so that `lib/` exists. Modern browsers
load the HTML and module files without a bundler.

## Browser prebuilt bundle

[`dist/index.html`](dist/index.html) loads `dist/rot.js` with a traditional
`<script>` tag. The bundle exposes the library through the global `ROT`
namespace.

Open:

```text
http://localhost:8080/examples/dist/
```

Run `npm run build` after source changes to refresh the prebuilt bundle.

## Browser bundled modules

[`bundled-modules/index.html`](bundled-modules/index.html) demonstrates an
application bundle created from `example.source.js` and `lib/index.js`.

Build the example with Rollup and Babel from the repository root:

```text
npm run examples:bundle
```

This cross-platform npm script rebuilds `lib/` and writes
`examples/bundled-modules/dist/example.bundle.js`. Then open:

```text
http://localhost:8080/examples/bundled-modules/
```

Regenerate `dist/example.bundle.js` after changing `example.source.js` or rebuilding
`lib/`.

## Basic addon composition

[`basic-addon/index.html`](basic-addon/index.html) is a complete, deterministic
combat slice rendered with `ROT.Display`. It combines immutable grid
coordinates, entity and component registries, typed events, a bounded message
buffer, and turn actor registration. The game rules are separated into types,
scenario, combat, monster-turn, inventory, and keyboard-control modules. The
slice includes player movement, melee combat, HP, death, XP, loot, inventory, a
healing potion, and weapon/armor slots.

Build the addon modules and serve the repository from the root:

```text
npm run examples:addons
npm run examples:serve
```

Open:

```text
http://localhost:8080/examples/basic-addon/
```

Use the arrow keys to move or attack, Space to wait, and `G` to pick up loot.
Press `1` to use a potion, `2` to equip a weapon, or `3` to equip armor. The HUD
shows player/monster health, XP, equipment, inventory, and recent messages. The
example does not write game messages to the terminal.

## Automated smoke tests

Build the required artifacts and run all example smoke tests with:

```text
npm run test:examples
```
