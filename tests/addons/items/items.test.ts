import {describe, expect, it} from 'vitest';

import type {
	Item,
	ItemInteractionHandler,
	ItemInteractionResult,
} from '@/addons/items/items.js';

interface RelicItem extends Item {
	readonly kind: 'relic';
	readonly charges: number;
}

interface QuestState {
	readonly progress: number;
}

type QuestAction = {readonly type: 'attune'} | {readonly type: 'inspect'};
type QuestEvent = {readonly type: 'relic-attuned'; readonly relicId: string};
type QuestEffect = {readonly type: 'unlock-door'; readonly doorId: string};
type QuestFailure = 'uncharged';

const relic: RelicItem = {
	id: 'sun-relic',
	name: 'Sun Relic',
	kind: 'relic',
	charges: 1,
};

const interactWithRelic: ItemInteractionHandler<
	RelicItem,
	QuestState,
	QuestAction,
	QuestEvent,
	QuestEffect,
	QuestFailure
> = (item, state, action) => {
	if (action.type !== 'attune') {
		return {status: 'unsupported', state};
	}
	if (item.charges === 0) {
		return {status: 'failed', state, failure: 'uncharged'};
	}
	return {
		status: 'applied',
		state: {progress: state.progress + 1},
		events: [{type: 'relic-attuned', relicId: item.id}],
		effects: [{type: 'unlock-door', doorId: 'sun-vault'}],
	};
};

function interact(
	item: RelicItem,
	state: QuestState,
	action: QuestAction,
): ItemInteractionResult<QuestState, QuestEvent, QuestEffect, QuestFailure> {
	return interactWithRelic(item, state, action);
}

describe('items addon contracts', () => {
	it('accepts a consumer-defined item and caller-owned interaction types', () => {
		const result = interact(relic, {progress: 0}, {type: 'attune'});

		expect(result).toEqual({
			status: 'applied',
			state: {progress: 1},
			events: [{type: 'relic-attuned', relicId: 'sun-relic'}],
			effects: [{type: 'unlock-door', doorId: 'sun-vault'}],
		});
	});

	it('preserves caller state for unsupported and unsuccessful interactions', () => {
		const state = {progress: 0};
		const unsupported = interact(relic, state, {type: 'inspect'});
		const uncharged = interact({...relic, charges: 0}, state, {type: 'attune'});

		expect(unsupported).toEqual({status: 'unsupported', state});
		expect(unsupported.state).toBe(state);
		expect(uncharged).toEqual({status: 'failed', state, failure: 'uncharged'});
		expect(uncharged.state).toBe(state);
	});
});
