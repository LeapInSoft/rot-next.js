import {describe, expect, it} from 'vitest';

import {addItem, createBackpack, findItem, hasItem, removeItem} from '@/addons/backpack/backpack.js';
import type {Item} from '@/addons/items/items.js';

interface Rune extends Item {
	readonly element: 'storm' | 'stone';
	readonly power: number;
}

const stormRune: Rune = {
	id: 'storm-rune',
	name: 'Storm Rune',
	element: 'storm',
	power: 3,
};

const stoneRune: Rune = {
	id: 'stone-rune',
	name: 'Stone Rune',
	element: 'stone',
	power: 2,
};

describe('backpack addon', () => {
	it('requires a positive integer slot capacity', () => {
		expect(() => createBackpack<Rune>(0)).toThrow(RangeError);
		expect(() => createBackpack<Rune>(1.5)).toThrow(RangeError);
	});

	it('stores consumer-defined items immutably and supports queries', () => {
		const backpack = createBackpack<Rune>();
		const added = addItem(backpack, stormRune);

		expect(added).toEqual({status: 'success', backpack: {items: [stormRune], capacity: 20}});
		expect(backpack.items).toEqual([]);
		expect(findItem(added.backpack, stormRune.id)).toBe(stormRune);
		expect(findItem(added.backpack, 'missing')).toBeUndefined();
		expect(hasItem(added.backpack, stormRune.id)).toBe(true);
		expect(hasItem(added.backpack, 'missing')).toBe(false);
	});

	it('rejects duplicate IDs without changing the backpack', () => {
		const backpack = addItem(createBackpack<Rune>(), stormRune).backpack;
		const result = addItem(backpack, {...stoneRune, id: stormRune.id});

		expect(result).toEqual({status: 'failure', backpack, reason: 'duplicate-id'});
		expect(result.backpack).toBe(backpack);
	});

	it('rejects additions at the configured slot limit without changing the backpack', () => {
		const backpack = addItem(createBackpack<Rune>(1), stormRune).backpack;
		const result = addItem(backpack, stoneRune);

		expect(result).toEqual({status: 'failure', backpack, reason: 'full'});
		expect(result.backpack).toBe(backpack);
	});

	it('removes an item immutably and preserves input when its ID is unknown', () => {
		const backpack = addItem(createBackpack<Rune>(), stormRune).backpack;
		const removed = removeItem(backpack, stormRune.id);
		const unknown = removeItem(backpack, 'missing');

		expect(removed).toEqual({status: 'success', backpack: {items: [], capacity: 20}, item: stormRune});
		expect(backpack.items).toEqual([stormRune]);
		expect(unknown).toEqual({status: 'failure', backpack, reason: 'unknown-id'});
		expect(unknown.backpack).toBe(backpack);
	});
});
