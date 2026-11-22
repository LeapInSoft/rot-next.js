/**
 * @fileoverview Immutable backpack storage for consumer-defined items.
 */

import type {Item} from '../items/items.js';

/** Backpack data with a configurable one-item-per-slot capacity. */
export interface Backpack<ItemType extends Item> {
	readonly items: readonly ItemType[];
	readonly capacity: number;
}

export type AddItemFailureReason = 'full' | 'duplicate-id';

export interface AddItemSuccess<ItemType extends Item> {
	readonly status: 'success';
	readonly backpack: Backpack<ItemType>;
}

export interface AddItemFailure<ItemType extends Item> {
	readonly status: 'failure';
	readonly backpack: Backpack<ItemType>;
	readonly reason: AddItemFailureReason;
}

export type AddItemResult<ItemType extends Item> =
	| AddItemSuccess<ItemType>
	| AddItemFailure<ItemType>;

export interface RemoveItemSuccess<ItemType extends Item> {
	readonly status: 'success';
	readonly backpack: Backpack<ItemType>;
	readonly item: ItemType;
}

export interface RemoveItemFailure<ItemType extends Item> {
	readonly status: 'failure';
	readonly backpack: Backpack<ItemType>;
	readonly reason: 'unknown-id';
}

export type RemoveItemResult<ItemType extends Item> =
	| RemoveItemSuccess<ItemType>
	| RemoveItemFailure<ItemType>;

/**
 * Creates an empty backpack with the default capacity of 20 one-item slots.
 * @param capacity Positive integer slot limit.
 * @throws RangeError if capacity is not a positive integer.
 */
export function createBackpack<ItemType extends Item>(capacity = 20): Backpack<ItemType> {
	if (!Number.isInteger(capacity) || capacity < 1) {
		throw new RangeError('Backpack capacity must be a positive integer.');
	}
	return {items: [], capacity};
}

/**
 * Adds an item, rejecting duplicate IDs before checking capacity.
 * A failure returns the exact input backpack unchanged.
 */
export function addItem<ItemType extends Item>(
	backpack: Backpack<ItemType>,
	item: ItemType,
): AddItemResult<ItemType> {
	const duplicate = backpack.items.some(({id}) => id === item.id);
	if (duplicate) {
		return {status: 'failure', backpack, reason: 'duplicate-id'};
	}
	if (backpack.items.length >= backpack.capacity) {
		return {status: 'failure', backpack, reason: 'full'};
	}
	return {status: 'success', backpack: {...backpack, items: [...backpack.items, item]}};
}

/**
 * Removes the item with the given ID or returns an unchanged backpack if absent.
 */
export function removeItem<ItemType extends Item>(
	backpack: Backpack<ItemType>,
	itemId: string,
): RemoveItemResult<ItemType> {
	const item = findItem(backpack, itemId);
	if (!item) {
		return {status: 'failure', backpack, reason: 'unknown-id'};
	}
	return {
		status: 'success',
		backpack: {...backpack, items: backpack.items.filter(candidate => candidate.id !== itemId)},
		item,
	};
}

/** Returns the first item with the given ID, or undefined if absent. */
export function findItem<ItemType extends Item>(
	{items}: Backpack<ItemType>,
	itemId: string,
): ItemType | undefined {
	return items.find(({id}) => id === itemId);
}

/** Returns whether the backpack contains an item with the given ID. */
export function hasItem<ItemType extends Item>(
	backpack: Backpack<ItemType>,
	itemId: string,
): boolean {
	return findItem(backpack, itemId) !== undefined;
}
