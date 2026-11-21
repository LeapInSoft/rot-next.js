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

```sh
cd examples/bundled-modules
./run.sh
```

The POSIX-compatible `run.sh` writes `example.bundle.js`. Then open:

```text
http://localhost:8080/examples/bundled-modules/
```

Regenerate `example.bundle.js` after changing `example.source.js` or rebuilding
`lib/`.
