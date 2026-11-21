# rot.js addons

Addon modules are opt-in architecture patterns. They have no global state and
do not monkey-patch the core library.

## Phase A domain foundation

- `core/grid.ts`: immutable grid coordinates and spatial helpers.
- `entities/registry.ts`: entity and component registries.
- `turns/actor.ts`: the turn-aware actor contract and scheduler registration.
- `pubsub/event_bus.ts`: typed event publication and subscriptions.
- `text/text_buffer.ts`: bounded message history.

## Legacy examples

The JavaScript files in this directory are legacy rot.js 0.5-era samples. They
remain available for reference, but the Phase A TypeScript modules above are the
supported addon foundation and are covered by contract tests.
