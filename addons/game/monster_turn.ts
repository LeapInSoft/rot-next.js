import {createGridCoordinate, manhattanDistance} from '../core/grid.js';
import {resolveCombat} from '../combat/combat.js';
import type {GameState} from './types.js';

export interface MonsterTurn {
	readonly state: GameState;
	readonly messages: readonly string[];
}

export function advanceMonster(state: GameState): MonsterTurn {
	const {monster, player} = state;
	if (!monster.alive || !player.alive) {
		return {state, messages: []};
	}

	if (manhattanDistance(monster.position, player.position) === 1) {
		const combat = resolveCombat({
			attacker: monster,
			target: player,
			action: {damage: monster.attack - (player.equipment.armor?.defense ?? 0)},
			context: {minimumDamage: 1},
		});
		const updatedPlayer = {
			...player,
			hp: combat.remainingHp,
			alive: !combat.defeated,
		};
		const messages = [
			`${monster.name} hits ${player.name} for ${combat.damage} damage.`,
			...(combat.defeated ? [`${player.name} falls in battle.`] : []),
		];
		return {state: {...state, player: updatedPlayer}, messages};
	}

	const deltaX = player.position.x - monster.position.x;
	const deltaY = player.position.y - monster.position.y;
	const step = Math.abs(deltaX) >= Math.abs(deltaY)
		? {x: Math.sign(deltaX), y: 0}
		: {x: 0, y: Math.sign(deltaY)};
	const position = createGridCoordinate(
		monster.position.x + step.x,
		monster.position.y + step.y,
	);
	const nextState = {...state, monster: {...monster, position}};
	return {state: nextState, messages: [`${monster.name} moves toward ${player.name}.`]};
}
