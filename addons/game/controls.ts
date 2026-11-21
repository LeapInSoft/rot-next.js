import type {Direction, GameAction, GameItem} from './types.js';

export function gameActionForKey(
	key: string,
	inventory: readonly GameItem[],
): GameAction | undefined {
	const direction = key === 'ArrowUp'
		? 'north'
		: key === 'ArrowDown'
			? 'south'
			: key === 'ArrowLeft'
			? 'west'
			: key === 'ArrowRight'
			? 'east'
			: undefined;
	if (direction) {
		return {type: 'move', direction};
	}
	if (key === ' ') {
		return {type: 'wait'};
	}
	if (key === 'g' || key === 'G') {
		return {type: 'pickup'};
	}

	const selectedItem = key === '1'
		? inventory.find(item => item.type === 'potion')
		: key === '2'
			? inventory.find(item => item.type === 'weapon')
			: key === '3'
				? inventory.find(item => item.type === 'armor')
				: undefined;
	return selectedItem
		? selectedItem.type === 'potion'
			? {type: 'use', itemId: selectedItem.id}
			: {type: 'equip', itemId: selectedItem.id}
		: undefined;
}
