import {createGridCoordinate} from '../core/grid.js';
import {resolveCombat} from '../combat/combat.js';
import {advanceMonster} from './monster_turn.js';
import {dropLoot, equipItem, pickupLoot, useItem} from './inventory.js';
import {basicScenario, createInitialGameState} from './scenario.js';
import type {Direction, GameAction, GameState, GameTransition} from './types.js';

export {createInitialGameState} from './scenario.js';
export {advanceMonster} from './monster_turn.js';
export type {
	ArmorItem,
	Direction,
	Equipment,
	GameAction,
	GameItem,
	GameState,
	GameTransition,
	GridCoordinate,
	GroundItem,
	Monster,
	Player,
	PotionItem,
	WeaponItem,
} from './types.js';

const directions: Record<Direction, {readonly x: number; readonly y: number}> = {
	north: {x: 0, y: -1},
	south: {x: 0, y: 1},
	east: {x: 1, y: 0},
	west: {x: -1, y: 0},
};

function finishTurn(state: GameState, messages: readonly string[]): GameTransition {
	const monsterTurn = advanceMonster(state);
	return {
		state: {...monsterTurn.state, turn: state.turn + 1},
		messages: [...messages, ...monsterTurn.messages],
	};
}

function movePlayer(state: GameState, direction: Direction): GameTransition {
	const {player, monster} = state;
	const delta = directions[direction];
	const target = createGridCoordinate(
		player.position.x + delta.x,
		player.position.y + delta.y,
	);
	if (target.x === monster.position.x && target.y === monster.position.y && monster.alive) {
		const combat = resolveCombat({
			attacker: player,
			target: monster,
			action: {damage: player.attack + (player.equipment.weapon?.attack ?? 0)},
		});
		const updatedMonster = {...monster, hp: combat.remainingHp, alive: !combat.defeated};
		const updatedPlayer = combat.defeated
			? {...player, xp: player.xp + monster.xpReward}
			: player;
		const messages = [
			`${player.name} hits ${monster.name} for ${combat.damage} damage.`,
			...(combat.defeated
				? [`${monster.name} dies. ${player.name} gains ${monster.xpReward} XP.`]
				: []),
		];
		const nextState = {
			...state,
			player: updatedPlayer,
			monster: updatedMonster,
			groundLoot: combat.defeated
				? dropLoot(monster.position, monster.drops)
				: state.groundLoot,
		};
		return finishTurn(nextState, messages);
	}

	const {width, height} = basicScenario.room;
	const isWall = target.x === 0
		|| target.y === 0
		|| target.x + 1 === width
		|| target.y + 1 === height;
	if (isWall) {
		return {state, messages: ['A wall blocks the way.']};
	}
	const nextState = {...state, player: {...player, position: target}};
	return finishTurn(nextState, [`${player.name} moves ${direction}.`]);
}

export function transitionGame(state: GameState, action: GameAction): GameTransition {
	if (!state.player.alive) {
		return {state, messages: ['You cannot act while dead.']};
	}

	switch (action.type) {
		case 'move':
			return movePlayer(state, action.direction);
		case 'wait':
			return finishTurn(state, [`${state.player.name} waits.`]);
		case 'pickup': {
			const result = pickupLoot(state);
			return result.changed
				? finishTurn(result.state, result.messages)
				: {state, messages: result.messages};
		}
		case 'use': {
			const result = useItem(state, action.itemId);
			return result.changed
				? finishTurn(result.state, result.messages)
				: {state, messages: result.messages};
		}
		case 'equip': {
			const result = equipItem(state, action.itemId);
			return result.changed
				? finishTurn(result.state, result.messages)
				: {state, messages: result.messages};
		}
		default:
			return {state, messages: []};
	}
}

