import {createGridCoordinate} from '../core/grid.js';
import type {ArmorItem, GameState, Monster, Player, WeaponItem} from './types.js';

export interface GameScenario {
	readonly room: {readonly width: number; readonly height: number};
	readonly player: Player;
	readonly monster: Monster;
}

const starterSword: WeaponItem = {
	id: 'oak-sword', name: 'oak sword', type: 'weapon', attack: 1,
};
const starterArmor: ArmorItem = {
	id: 'leather-armor', name: 'leather armor', type: 'armor', defense: 1,
};

export const basicScenario: GameScenario = {
	room: {width: 11, height: 9},
	player: {
		id: 'hero',
		name: 'Ada',
		position: createGridCoordinate(3, 4),
		hp: 20,
		maxHp: 20,
		attack: 3,
		xp: 0,
		alive: true,
		inventory: [],
		equipment: {weapon: starterSword, armor: starterArmor},
	},
	monster: {
		id: 'goblin',
		name: 'Goblin',
		position: createGridCoordinate(7, 4),
		hp: 12,
		attack: 3,
		xpReward: 10,
		drops: [
			{id: 'healing-potion', name: 'healing potion', type: 'potion', healing: 8},
			{id: 'iron-sword', name: 'iron sword', type: 'weapon', attack: 5},
			{id: 'iron-armor', name: 'iron armor', type: 'armor', defense: 2},
		],
		alive: true,
	},
};

export function createInitialGameState(): GameState {
	const {player, monster} = basicScenario;
	return {
		turn: 0,
		player: {
			...player,
			position: createGridCoordinate(player.position.x, player.position.y),
			inventory: [],
			equipment: {...player.equipment},
		},
		monster: {
			...monster,
			position: createGridCoordinate(monster.position.x, monster.position.y),
			drops: [...monster.drops],
		},
		groundLoot: [],
	};
}
