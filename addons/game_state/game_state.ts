/**
 * @fileoverview Generic ordered composition for consumer-defined game-state transitions.
 */

/** A transition decision that either applies, declines, or fails. */
export type StateTransitionDecision<State, Event, Effect, Failure> =
	| AppliedStateTransition<State, Event, Effect>
	| UnhandledStateTransition
	| FailedStateTransition<Failure>;

/** A transition that explicitly replaces state and returns events and effects. */
export interface AppliedStateTransition<State, Event, Effect> {
	readonly status: 'applied';
	readonly state: State;
	readonly events: readonly Event[];
	readonly effects: readonly Effect[];
}

/** A transition that declines to handle an action. */
export interface UnhandledStateTransition {
	readonly status: 'unhandled';
}

/** A terminal transition failure without replacement state. */
export interface FailedStateTransition<Failure> {
	readonly status: 'failed';
	readonly failure: Failure;
}

/**
 * A pure handler over consumer-owned state and action types. Implementations
 * must not mutate either input.
 */
export interface StateTransition<State, Action, Event, Effect, Failure> {
	(
		state: State,
		action: Action,
	): StateTransitionDecision<State, Event, Effect, Failure>;
}

/** The outcome of composing transitions, including unchanged state on decline or failure. */
export type StateCompositionResult<State, Event, Effect, Failure> =
	| AppliedStateTransition<State, Event, Effect>
	| UnhandledStateComposition<State>
	| FailedStateComposition<State, Failure>;

/** The composition had no transition that handled the action. */
export interface UnhandledStateComposition<State> {
	readonly status: 'unhandled';
	readonly state: State;
}

/** A transition failed; the original state is retained. */
export interface FailedStateComposition<State, Failure> {
	readonly status: 'failed';
	readonly state: State;
	readonly failure: Failure;
}

/**
 * Runs transitions in order. Each receives the same state and action; the first
 * applied or failed result is terminal. Returned effects are never executed.
 */
export function composeTransitions<State, Action, Event, Effect, Failure>(
	state: State,
	action: Action,
	transitions: readonly StateTransition<State, Action, Event, Effect, Failure>[],
): StateCompositionResult<State, Event, Effect, Failure> {
	for (const transition of transitions) {
		const decision = transition(state, action);
		if (decision.status === 'applied') {
			return decision;
		}
		if (decision.status === 'failed') {
			return {status: 'failed', state, failure: decision.failure};
		}
	}
	return {status: 'unhandled', state};
}
