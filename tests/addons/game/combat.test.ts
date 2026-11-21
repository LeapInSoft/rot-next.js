import {describe, expect, it} from 'vitest';

import {attackPlayer, attackMonster} from '@/addons/game/combat.js';
import {createInitialGameState, transitionGame} from '@/addons/game/game.js';
import type {GameState} from '@/addons/game/game.js';

describe('game combat', () => {
	it('applies equipped weapon damage and awards XP when the monster dies', () => {
		const {player, monster} = createInitialGameState();
		const firstAttack = attackMonster(player, monster);
		const secondAttack = attackMonster(firstAttack.player, firstAttack.monster);
		const finalAttack = attackMonster(secondAttack.player, secondAttack.monster);

		expect(firstAttack.monster.hp).toBe(8);
		expect(finalAttack.monster.alive).toBe(false);
		expect(finalAttack.player.xp).toBe(10);
		expect(finalAttack.messages).toContain('Goblin dies. Ada gains 10 XP.');
	});

	it('reduces damage by armor, marks death, and rejects later actions', () => {
		const initialState = createInitialGameState();
		const lowHealthState: GameState = {
			...initialState,
			player: {...initialState.player, hp: 2},
		};
		const attack = attackPlayer(lowHealthState.player, lowHealthState.monster);
		const defeatedState = {...lowHealthState, player: attack.player};
		const {state, messages} = transitionGame(defeatedState, {type: 'wait'});

		expect(attack.player.hp).toBe(0);
		expect(attack.player.alive).toBe(false);
		expect(attack.messages).toContain('Ada falls in battle.');
		expect(state).toBe(defeatedState);
		expect(messages).toContain('You cannot act while dead.');
	});
});
