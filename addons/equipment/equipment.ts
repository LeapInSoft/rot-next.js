/**
 * @fileoverview Immutable equipment slots and transitions for consumer-defined state and items.
 */

import type {Item} from '../items/items.js';

/** A data-driven set of slots with a single optional item in each slot. */
export interface Equipment<ItemType extends Item> {
	readonly slots: Readonly<Record<string, ItemType | undefined>>;
}

/** Caller-owned state containing equipment and any other consumer-defined fields. */
export interface EquipmentState<ItemType extends Item> {
	readonly equipment: Equipment<ItemType>;
}

export interface EquipEvent<ItemType extends Item> {
	readonly type: 'equipped';
	readonly slot: string;
	readonly item: ItemType;
}

export interface UnequipEvent<ItemType extends Item> {
	readonly type: 'unequipped';
	readonly slot: string;
	readonly item: ItemType;
}

export type EquipmentEvent<ItemType extends Item> = EquipEvent<ItemType> | UnequipEvent<ItemType>;

export interface EquipSuccess<State, ItemType extends Item> {
	readonly status: 'success';
	readonly transition: 'equipped';
	readonly state: State;
	readonly item: ItemType;
	readonly displacedItem: ItemType | undefined;
	readonly events: readonly EquipmentEvent<ItemType>[];
}

export interface UnequipSuccess<State, ItemType extends Item> {
	readonly status: 'success';
	readonly transition: 'unequipped';
	readonly state: State;
	readonly item: ItemType;
	readonly events: readonly EquipmentEvent<ItemType>[];
}

export interface EquipmentFailure<State> {
	readonly status: 'failure';
	readonly state: State;
	readonly reason: 'invalid-slot' | 'invalid-item' | 'empty-slot';
}

export type EquipmentResult<State, ItemType extends Item> =
	| EquipSuccess<State, ItemType>
	| UnequipSuccess<State, ItemType>
	| EquipmentFailure<State>;

/** Creates empty equipment using the consumer's configured slot names. */
export function createEquipment<ItemType extends Item>(slots: readonly string[]): Equipment<ItemType> {
	const configuredSlots = slots.reduce<Record<string, ItemType | undefined>>(
		(result, slot) => ({...result, [slot]: undefined}),
		{},
	);
	return {slots: configuredSlots};
}

/** Equips a consumer-selected item into a configured slot and returns any displaced item. */
export function equipItem<ItemType extends Item, State extends EquipmentState<ItemType>>(
	state: State,
	slot: string,
	item: ItemType,
	canEquip: (state: State, item: ItemType) => boolean,
): EquipSuccess<State, ItemType> | EquipmentFailure<State> {
	if (!Object.prototype.hasOwnProperty.call(state.equipment.slots, slot)) {
		return {status: 'failure', state, reason: 'invalid-slot'};
	}
	if (!canEquip(state, item)) {
		return {status: 'failure', state, reason: 'invalid-item'};
	}

	const displacedItem = state.equipment.slots[slot];
	const nextSlots = {...state.equipment.slots, [slot]: item};
	const nextState = {
		...state,
		equipment: {...state.equipment, slots: nextSlots},
	};
	const events: EquipmentEvent<ItemType>[] = [
		...(displacedItem ? [{type: 'unequipped' as const, slot, item: displacedItem}] : []),
		{type: 'equipped', slot, item},
	];
	return {status: 'success', transition: 'equipped', state: nextState, item, displacedItem, events};
}

/** Removes a configured slot's item and returns it for the consumer to handle. */
export function unequipItem<ItemType extends Item, State extends EquipmentState<ItemType>>(
	state: State,
	slot: string,
): UnequipSuccess<State, ItemType> | EquipmentFailure<State> {
	if (!Object.prototype.hasOwnProperty.call(state.equipment.slots, slot)) {
		return {status: 'failure', state, reason: 'invalid-slot'};
	}
	const item = state.equipment.slots[slot];
	if (!item) {
		return {status: 'failure', state, reason: 'empty-slot'};
	}

	const nextSlots = {...state.equipment.slots, [slot]: undefined};
	const nextState = {
		...state,
		equipment: {...state.equipment, slots: nextSlots},
	};
	return {
		status: 'success',
		transition: 'unequipped',
		state: nextState,
		item,
		events: [{type: 'unequipped', slot, item}],
	};
}
