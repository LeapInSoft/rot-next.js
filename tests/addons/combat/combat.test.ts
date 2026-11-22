import {describe, expect, it} from 'vitest';

import {resolveCombat} from '@/addons/combat/combat.js';

describe('standalone combat', () => {
	const attacker = {id: 'ranger', hp: 12, attack: 4, role: 'player'};

	it('returns domain events for a nonlethal hit without changing combatants', () => {
		const target = {id: 'slime', hp: 7, armor: 1, role: 'monster'};
		const result = resolveCombat({attacker, target, action: {damage: 3}});

		expect(result).toEqual({
			damage: 3,
			remainingHp: 4,
			defeated: false,
			events: [{type: 'damaged', attackerId: 'ranger', targetId: 'slime', damage: 3}],
		});
		expect(target.hp).toBe(7);
	});

	it('marks a target defeated at the exact health boundary', () => {
		const target = {id: 'slime', hp: 3, role: 'monster'};
		const result = resolveCombat({attacker, target, action: {damage: 3}});

		expect(result.remainingHp).toBe(0);
		expect(result.defeated).toBe(true);
		expect(result.events).toEqual([
			{type: 'damaged', attackerId: 'ranger', targetId: 'slime', damage: 3},
			{type: 'defeated', combatantId: 'slime', defeatedBy: 'ranger'},
		]);
	});

	it('clamps overkill to zero remaining health', () => {
		const result = resolveCombat({
			attacker,
			target: {id: 'slime', hp: 2},
			action: {damage: 5},
		});

		expect(result.damage).toBe(5);
		expect(result.remainingHp).toBe(0);
		expect(result.defeated).toBe(true);
	});
});
