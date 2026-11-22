# rot-next.js addons

These opt-in TypeScript addons provide reusable game functionality without
global state or monkey-patching the core library.

## Available addons

- `core/grid.ts`: immutable grid coordinates and spatial helpers.
- `entities/registry.ts`: entity and component registries.
- `game/`: game state, scenarios, combat, inventory, controls, and monster turns.
- `pubsub/event_bus.ts`: typed event publication and subscriptions.
- `text/text_buffer.ts`: bounded message history.
- `turns/actor.ts`: the turn-aware actor contract and scheduler registration.

Import addons from the `rot-next.js/addons/*` package subpaths.
