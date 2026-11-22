# rot-next.js addons

These opt-in TypeScript addons provide reusable game functionality without
global state or monkey-patching the core library.

## Available addons

- `core/grid.ts`: immutable grid coordinates and spatial helpers.
- `entities/registry.ts`: entity and component registries.
- `combat/combat.ts`: structural combat resolution over consumer-defined
  combatants, returning damage, remaining health, defeat status, and typed
  combat events without mutating game state or formatting messages.
- `game/`: sample game state, scenarios, inventory, controls, and monster turns.
- `game_state/game_state.ts`: ordered composition of pure transitions over consumer-defined state and action types, returning typed events/effects without imposing game fields, turn policy, or effect execution.
- `items/items.ts`: consumer-extensible item identity and typed interaction
  result/handler contracts. Handlers use caller-owned context, action, event,
  effect, and failure types; unsupported and failed results retain the input
  context without prescribing presentation or other game behavior.
- `backpack/backpack.ts`: immutable, generic item storage with a configurable
  one-item-per-slot capacity (default 20), duplicate-ID rejection, typed
  add/remove outcomes, and item lookup helpers.
- `equipment/equipment.ts`: generic, immutable equipment slots configured by
  consumers, equip/unequip transitions, and typed transition events. Consumers
  provide their own state shape, item eligibility policy, and handling of
  displaced or unequipped items.
- `pubsub/event_bus.ts`: typed event publication and subscriptions.
- `text/text_buffer.ts`: bounded message history.
- `turns/actor.ts`: the turn-aware actor contract and scheduler registration.

Import addons from the `rot-next.js/addons/*` package subpaths.
