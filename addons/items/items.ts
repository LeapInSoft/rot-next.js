/**
 * @fileoverview Reusable item identity and interaction contracts.
 */

/** Consumer-extensible identity shared by item data contracts. */
export interface Item {
	readonly id: string;
	readonly name: string;
}

/** An interaction that replaces caller state and emits typed events/effects. */
export interface AppliedItemInteraction<Context, Event, Effect> {
	readonly status: 'applied';
	readonly state: Context;
	readonly events: readonly Event[];
	readonly effects: readonly Effect[];
}

/** An unsupported interaction; state remains the unchanged input context. */
export interface UnsupportedItemInteraction<Context> {
	readonly status: 'unsupported';
	readonly state: Context;
}

/** A rejected interaction; state remains the unchanged input context. */
export interface FailedItemInteraction<Context, Failure> {
	readonly status: 'failed';
	readonly state: Context;
	readonly failure: Failure;
}

export type ItemInteractionResult<Context, Event, Effect, Failure> =
	| AppliedItemInteraction<Context, Event, Effect>
	| UnsupportedItemInteraction<Context>
	| FailedItemInteraction<Context, Failure>;

export interface ItemInteractionHandler<
	ItemType extends Item,
	Context,
	Action,
	Event,
	Effect,
	Failure,
> {
	(
		item: ItemType,
		context: Context,
		action: Action,
	): ItemInteractionResult<Context, Event, Effect, Failure>;
}
