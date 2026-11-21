import {describe, expect, it} from 'vitest';

import {createInitialGameState, transitionGame} from '@/addons/game/game.js';
import type {GameAction, GameState} from '@/addons/game/game.js';

function act(state: GameState, action: GameAction): GameState {
	return transitionGame(state, action).state;
}

describe('basic addon game integration', () => {
	it('defeats the goblin and collects its loot', () => {
		const initialState = createInitialGameState();
		const defeatedState = Array.from({length: 5}).reduce(
			(state: GameState) => act(state, {type: 'move', direction: 'east'}),
			initialState,
		);
		const lootTileState = act(defeatedState, {type: 'move', direction: 'east'});
		const collectedState = act(lootTileState, {type: 'pickup'});

		expect(defeatedState.monster.alive).toBe(false);
		expect(defeatedState.player.xp).toBe(10);
		expect(collectedState.groundLoot).toHaveLength(0);
		expect(collectedState.player.inventory.map(item => item.id)).toEqual([
			'healing-potion',
			'iron-sword',
			'iron-armor',
		]);
	});
});
