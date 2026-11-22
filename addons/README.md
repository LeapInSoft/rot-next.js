# rot-next.js addons

These opt-in TypeScript addons provide reusable game functionality without
global state or monkey-patching the core library.

## Available addons

- `core/grid.ts`: immutable grid coordinates and spatial helpers.
- `entities/registry.ts`: entity and component registries.
- `game/`: game state, scenarios, combat, inventory, controls, and monster turns.
- `items/items.ts`: consumer-extensible item identity and typed interaction
  result/handler contracts. Handlers use caller-owned context, action, event,
  effect, and failure types; unsupported and failed results retain the input
  context without prescribing presentation or other game behavior.
- `backpack/backpack.ts`: immutable, generic item storage with a configurable
  one-item-per-slot capacity (default 20), duplicate-ID rejection, typed
  add/remove outcomes, and item lookup helpers.
- `pubsub/event_bus.ts`: typed event publication and subscriptions.
- `text/text_buffer.ts`: bounded message history.
- `turns/actor.ts`: the turn-aware actor contract and scheduler registration.

Import addons from the `rot-next.js/addons/*` package subpaths.
