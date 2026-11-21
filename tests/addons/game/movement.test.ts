import {describe, expect, it} from 'vitest';

import {createInitialGameState, transitionGame} from '@/addons/game/game.js';

describe('game movement', () => {
	it('moves the player and lets the goblin take a deterministic turn', () => {
		const initialState = createInitialGameState();
		const {state, messages} = transitionGame(initialState, {type: 'move', direction: 'east'});

		expect(state.player.position).toEqual({x: 4, y: 4});
		expect(state.monster.position).toEqual({x: 6, y: 4});
		expect(state.turn).toBe(1);
		expect(messages).toContain('Ada moves east.');
	});

	it('does not advance the turn when a wall blocks movement', () => {
		const initialState = createInitialGameState();
		const atNorthWall = {
			...initialState,
			player: {...initialState.player, position: {x: 3, y: 1}},
		};
		const {state, messages} = transitionGame(atNorthWall, {type: 'move', direction: 'north'});

		expect(state).toBe(atNorthWall);
		expect(state.turn).toBe(0);
		expect(messages).toContain('A wall blocks the way.');
	});
});
