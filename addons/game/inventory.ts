import type {GridCoordinate} from '../core/grid.js';
import type {GameItem, GameState, GroundItem} from './types.js';

export interface InventoryResult {
	readonly state: GameState;
	readonly messages: readonly string[];
	readonly changed: boolean;
}

export function dropLoot(
	position: GridCoordinate,
	loot: readonly GameItem[],
): GroundItem[] {
	return loot.map(item => ({item, position}));
}

export function pickupLoot(state: GameState): InventoryResult {
	const {player, groundLoot} = state;
	const pickedUp = groundLoot.filter(({position}) =>
		position.x === player.position.x && position.y === player.position.y,
	);
	if (pickedUp.length === 0) {
		return {state, messages: ['There is nothing here to pick up.'], changed: false};
	}

	const pickedUpIds = new Set(pickedUp.map(({item}) => item.id));
	const names = pickedUp.map(({item}) => item.name).join(', ');
	const nextState = {
		...state,
		player: {...player, inventory: [...player.inventory, ...pickedUp.map(({item}) => item)]},
		groundLoot: groundLoot.filter(({item}) => !pickedUpIds.has(item.id)),
	};
	return {state: nextState, messages: [`${player.name} picks up ${names}.`], changed: true};
}

export function useItem(state: GameState, itemId: string): InventoryResult {
	const {player} = state;
	const item = player.inventory.find(candidate => candidate.id === itemId);
	if (!item || item.type !== 'potion') {
		return {state, messages: ['That item cannot be used.'], changed: false};
	}

	const hp = Math.min(player.maxHp, player.hp + item.healing);
	const inventory = player.inventory.filter(candidate => candidate.id !== itemId);
	const nextState = {...state, player: {...player, hp, inventory}};
	return {
		state: nextState,
		messages: [`${player.name} uses ${item.name} and recovers ${hp - player.hp} HP.`],
		changed: true,
	};
}

export function equipItem(state: GameState, itemId: string): InventoryResult {
	const {player} = state;
	const item = player.inventory.find(candidate => candidate.id === itemId);
	if (!item || item.type === 'potion') {
		return {state, messages: ['That item cannot be equipped.'], changed: false};
	}

	const slot = item.type;
	const previousItem = player.equipment[slot];
	const inventory = player.inventory.filter(candidate => candidate.id !== itemId);
	const nextInventory = previousItem ? [...inventory, previousItem] : inventory;
	const equipment = {...player.equipment, [slot]: item};
	const nextState = {
		...state,
		player: {...player, inventory: nextInventory, equipment},
	};
	return {state: nextState, messages: [`${player.name} equips ${item.name}.`], changed: true};
}

