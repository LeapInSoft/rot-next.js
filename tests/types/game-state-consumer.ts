import {composeTransitions} from 'rot-next.js/addons/game_state/game_state.js';
import type {StateTransition} from 'rot-next.js/addons/game_state/game_state.js';

interface CustomState {
	readonly score: number;
	readonly unlocked: boolean;
}

type CustomAction = {readonly type: 'score'} | {readonly type: 'unlock'};
type CustomEvent = {readonly type: 'scored'; readonly amount: number};
type CustomEffect = {readonly type: 'celebrate'};
type CustomFailure = 'locked';

type CustomTransition = StateTransition<
	CustomState,
	CustomAction,
	CustomEvent,
	CustomEffect,
	CustomFailure
>;

const score: CustomTransition = (state, action) => action.type !== 'score'
	? {status: 'unhandled'}
	: {
		status: 'applied',
		state: {...state, score: state.score + 1},
		events: [{type: 'scored', amount: 1}],
		effects: [{type: 'celebrate'}],
	};
const unlock: CustomTransition = (state, action) => action.type !== 'unlock'
	? {status: 'unhandled'}
	: state.score > 0
		? {
			status: 'applied',
			state: {...state, unlocked: true},
			events: [],
			effects: [],
		}
		: {status: 'failed', failure: 'locked'};

const result = composeTransitions(
	{score: 0, unlocked: false},
	{type: 'score'},
	[unlock, score],
);
if (result.status === 'applied') {
	const nextState: CustomState = result.state;
	const events: readonly CustomEvent[] = result.events;
	const effects: readonly CustomEffect[] = result.effects;
	void [nextState, events, effects];
}
