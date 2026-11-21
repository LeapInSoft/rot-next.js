import {describe, expect, it} from 'vitest';

import {createInitialGameState, transitionGame} from '@/addons/game/game.js';
import type {GameAction, GameState} from '@/addons/game/game.js';

function act(state: GameState, action: GameAction): GameState {
	return transitionGame(state, action).state;
}

function defeatedGoblin(): GameState {
	const engagedState = Array.from({length: 2}).reduce(
		(state: GameState) => act(state, {type: 'move', direction: 'east'}),
		createInitialGameState(),
	);
	return Array.from({length: 3}).reduce(
		(state: GameState) => act(state, {type: 'move', direction: 'east'}),
		engagedState,
	);
}

describe('game inventory', () => {
	it('picks up loot, uses a potion, and swaps both equipment slots', () => {
		const defeatedState = defeatedGoblin();
		const lootTileState = act(defeatedState, {type: 'move', direction: 'east'});
		const inventoryState = act(lootTileState, {type: 'pickup'});
		const healedState = act(inventoryState, {type: 'use', itemId: 'healing-potion'});
		const weaponState = act(healedState, {type: 'equip', itemId: 'iron-sword'});
		const equippedState = act(weaponState, {type: 'equip', itemId: 'iron-armor'});

		expect(inventoryState.player.inventory.map(item => item.id)).toEqual([
			'healing-potion',
			'iron-sword',
			'iron-armor',
		]);
		expect(healedState.player.hp).toBeGreaterThan(inventoryState.player.hp);
		expect(equippedState.player.equipment.weapon?.id).toBe('iron-sword');
		expect(equippedState.player.equipment.armor?.id).toBe('iron-armor');
		expect(equippedState.player.inventory.map(item => item.id)).toContain('oak-sword');
		expect(equippedState.player.inventory.map(item => item.id)).toContain('leather-armor');
		expect(equippedState.groundLoot).toHaveLength(0);
	});

	it('does not mutate state or advance time when there is nothing to pick up', () => {
		const initialState = createInitialGameState();
		const {state, messages} = transitionGame(initialState, {type: 'pickup'});

		expect(state).toBe(initialState);
		expect(state.turn).toBe(0);
		expect(messages).toContain('There is nothing here to pick up.');
	});
});
