import {describe, expect, it} from 'vitest';

import {advanceMonster} from '@/addons/game/monster_turn.js';
import {createInitialGameState, transitionGame} from '@/addons/game/game.js';

describe('monster turns', () => {
	it('moves toward the player when not adjacent', () => {
		const initialState = createInitialGameState();
		const {state, messages} = advanceMonster(initialState);

		expect(state.monster.position).toEqual({x: 6, y: 4});
		expect(messages).toContain('Goblin moves toward Ada.');
	});

	it('attacks the player when adjacent and skips its turn after death', () => {
		const initialState = createInitialGameState();
		const adjacentState = {
			...initialState,
			monster: {...initialState.monster, position: {x: 4, y: 4}},
		};
		const attacked = advanceMonster(adjacentState);
		const deadPlayerState = {
			...adjacentState,
			player: {...attacked.state.player, alive: false, hp: 0},
		};
		const skipped = advanceMonster(deadPlayerState);

		expect(attacked.state.player.hp).toBe(18);
		expect(attacked.messages).toContain('Goblin hits Ada for 2 damage.');
		expect(skipped.state).toBe(deadPlayerState);
		expect(skipped.messages).toEqual([]);
	});

	it('marks a defeated player and prevents further game actions', () => {
		const initialState = createInitialGameState();
		const adjacentState = {
			...initialState,
			player: {...initialState.player, hp: 2},
			monster: {...initialState.monster, position: {x: 4, y: 4}},
		};
		const attacked = advanceMonster(adjacentState);
		const blocked = transitionGame({...adjacentState, player: attacked.state.player}, {type: 'wait'});

		expect(attacked.state.player.hp).toBe(0);
		expect(attacked.state.player.alive).toBe(false);
		expect(attacked.messages).toContain('Ada falls in battle.');
		expect(blocked.state).toEqual({...adjacentState, player: attacked.state.player});
		expect(blocked.messages).toContain('You cannot act while dead.');
	});
});
