import {addItem, createBackpack, findItem, hasItem, removeItem} from 'rot-next.js/addons/backpack/backpack.js';
import type {Item} from 'rot-next.js/addons/items/items.js';

interface CustomCargo extends Item {
	readonly mass: number;
	readonly fragile: boolean;
}

const cargo: CustomCargo = {id: 'glass-vial', name: 'Glass Vial', mass: 1, fragile: true};
const empty = createBackpack<CustomCargo>();
const added = addItem(empty, cargo);
if (added.status === 'success') {
	const item: CustomCargo | undefined = findItem(added.backpack, cargo.id);
	const present: boolean = hasItem(added.backpack, cargo.id);
	const removed = removeItem(added.backpack, cargo.id);
	void [item, present, removed];
}
const limited = createBackpack<CustomCargo>(4);
void limited;
