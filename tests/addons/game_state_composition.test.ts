import {describe, expect, it} from 'vitest';

import {composeTransitions} from '@/addons/game_state/game_state.js';
import type {StateTransition} from '@/addons/game_state/game_state.js';

interface CampaignState {
	readonly keys: readonly string[];
	readonly openDoors: readonly string[];
}

type CampaignAction =
	| {readonly type: 'collect-key'; readonly key: string}
	| {readonly type: 'open-door'; readonly doorId: string}
	| {readonly type: 'wait'};

type CampaignEvent =
	| {readonly type: 'key-collected'; readonly key: string}
	| {readonly type: 'door-opened'; readonly doorId: string};

type CampaignEffect =
	| {readonly type: 'play-sound'; readonly sound: 'key' | 'door'}
	| {readonly type: 'unlock-exit'};

type CampaignFailure = 'missing-key';

type CampaignTransition = StateTransition<
	CampaignState,
	CampaignAction,
	CampaignEvent,
	CampaignEffect,
	CampaignFailure
>;

const collectKey: CampaignTransition = (state, action) => action.type !== 'collect-key'
	? {status: 'unhandled'}
	: {
		status: 'applied',
		state: {keys: [...state.keys, action.key], openDoors: state.openDoors},
		events: [{type: 'key-collected', key: action.key}],
		effects: [{type: 'play-sound', sound: 'key'}],
	};

const openDoor: CampaignTransition = (state, action) => action.type !== 'open-door'
	? {status: 'unhandled'}
	: state.keys.includes('brass')
		? {
			status: 'applied',
			state: {keys: state.keys, openDoors: [...state.openDoors, action.doorId]},
			events: [{type: 'door-opened', doorId: action.doorId}],
			effects: [{type: 'play-sound', sound: 'door'}, {type: 'unlock-exit'}],
		}
		: {status: 'failed', failure: 'missing-key'};

const initialState: CampaignState = {keys: [], openDoors: []};

describe('generic state transition composition', () => {
	it('supports independent transitions over a consumer-defined state', () => {
		const keyResult = composeTransitions(
			initialState,
			{type: 'collect-key', key: 'brass'},
			[openDoor, collectKey],
		);
		const doorResult = composeTransitions(
			keyResult.state,
			{type: 'open-door', doorId: 'vault'},
			[collectKey, openDoor],
		);

		expect(keyResult).toEqual({
			status: 'applied',
			state: {keys: ['brass'], openDoors: []},
			events: [{type: 'key-collected', key: 'brass'}],
			effects: [{type: 'play-sound', sound: 'key'}],
		});
		expect(doorResult).toEqual({
			status: 'applied',
			state: {keys: ['brass'], openDoors: ['vault']},
			events: [{type: 'door-opened', doorId: 'vault'}],
			effects: [
				{type: 'play-sound', sound: 'door'},
				{type: 'unlock-exit'},
			],
		});
	});

	it('uses ordered first-match dispatch with the same input state and action', () => {
		const state = Object.freeze({keys: ['brass'], openDoors: []});
		const action = Object.freeze({type: 'open-door', doorId: 'vault'} as const);
		let laterTransitionCalled = false;
		const declines: CampaignTransition = (receivedState, receivedAction) => {
			expect(receivedState).toBe(state);
			expect(receivedAction).toBe(action);
			return {status: 'unhandled'};
		};
		const applies: CampaignTransition = (receivedState, receivedAction) => {
			expect(receivedState).toBe(state);
			expect(receivedAction).toBe(action);
			if (receivedAction.type !== 'open-door') {
				return {status: 'unhandled'};
			}
			return {
				status: 'applied',
				state: {...receivedState, openDoors: [receivedAction.doorId]},
				events: [{type: 'door-opened', doorId: receivedAction.doorId}],
				effects: [{type: 'unlock-exit'}],
			};
		};
		const later: CampaignTransition = () => {
			laterTransitionCalled = true;
			return {status: 'unhandled'};
		};

		const result = composeTransitions(state, action, [declines, applies, later]);

		expect(result.status).toBe('applied');
		expect(laterTransitionCalled).toBe(false);
		expect(state.openDoors).toEqual([]);
	});

	it('stops on failure and retains the original state', () => {
		const state: CampaignState = {keys: [], openDoors: []};
		let laterTransitionCalled = false;
		const fails: CampaignTransition = () => ({status: 'failed', failure: 'missing-key'});
		const later: CampaignTransition = () => {
			laterTransitionCalled = true;
			return {
				status: 'applied',
				state: {keys: [], openDoors: ['vault']},
				events: [{type: 'door-opened', doorId: 'vault'}],
				effects: [{type: 'unlock-exit'}],
			};
		};

		const result = composeTransitions(state, {type: 'open-door', doorId: 'vault'}, [fails, later]);

		expect(result).toEqual({status: 'failed', state, failure: 'missing-key'});
		expect(result.state).toBe(state);
		expect(laterTransitionCalled).toBe(false);
	});

	it('returns unhandled and retains the original state when no transition applies', () => {
		const state: CampaignState = {keys: [], openDoors: []};
		const result = composeTransitions(state, {type: 'wait'}, [collectKey, openDoor]);

		expect(result).toEqual({status: 'unhandled', state});
		expect(result.state).toBe(state);
	});
});
