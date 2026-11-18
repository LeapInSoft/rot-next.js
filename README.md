# rot-next.js

**A roguelike toolkit for JavaScript and TypeScript.**

rot-next.js is a modernized fork of [rot.js](https://github.com/ondras/rot.js), the Roguelike Toolkit in JavaScript. Maintained by LeapInSoft, it aims to modernize the codebase, fix bugs, and add thoughtful features while keeping the toolkit approachable for JavaScript and TypeScript developers.

Programming concepts, design, and the craft of building software matter. AI and LLMs are tools to help turn ideas into code more quickly, not substitutes for understanding or programming judgment. The hope is that rot-next.js will be useful to build with and offer something to learn from.

## Library

rot-next.js is written in TypeScript and provides several ways to use the library:

- The build's `lib/` directory contains ES modules for modern JavaScript projects and bundlers.
- The `dist/rot.js` bundle can be included in a browser with a traditional `<script>` tag. It exposes the library through the global `ROT` namespace.
- The `dist/rot.min.js` bundle provides the same browser API in a minified file.

For browser examples, see [native modules](./examples/native-modules/), [bundled modules](./examples/bundled-modules/), and [the prebuilt bundle](./examples/dist/).

### Downloading

- Clone this repository to access the source and included distribution files.
- For a published npm release, install the package with `npm install rot-next.js`.
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
