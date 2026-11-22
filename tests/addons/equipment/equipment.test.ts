import {describe, expect, it} from 'vitest';

import {createEquipment, equipItem, unequipItem} from '@/addons/equipment/equipment.js';
import type {Item} from '@/addons/items/items.js';

interface CustomRelic extends Item {
	readonly bonus: number;
}

interface CustomState {
	readonly equipment: ReturnType<typeof createEquipment<CustomRelic>>;
	readonly marker: string;
}

const relic: CustomRelic = {id: 'ember', name: 'Ember Relic', bonus: 4};
const ward: CustomRelic = {id: 'ward', name: 'Ward Relic', bonus: 2};
const invalidRelic: CustomRelic = {id: 'invalid', name: 'Invalid Relic', bonus: 0};
const canEquip = (_state: CustomState, item: CustomRelic) => item.bonus > 0;

function createState(): CustomState {
	return {
		equipment: createEquipment<CustomRelic>(['charm', 'ward']),
		marker: 'caller-owned state',
	};
}

describe('equipment addon', () => {
	it('equips consumer-defined items in configured slots without an inventory model', () => {
		const state = createState();
		const result = equipItem(state, 'charm', relic, canEquip);

		expect(result.status).toBe('success');
		if (result.status === 'success') {
			expect(result.state.equipment.slots.charm).toBe(relic);
			expect(result.item).toBe(relic);
			expect(result.displacedItem).toBeUndefined();
			expect(result.events).toEqual([{type: 'equipped', slot: 'charm', item: relic}]);
			expect(result.state.marker).toBe(state.marker);
		}
		expect(state.equipment.slots.charm).toBeUndefined();
	});

	it('returns the displaced item on swap and the removed item on unequip', () => {
		const first = equipItem(createState(), 'charm', relic, canEquip);
		if (first.status !== 'success') {
			throw new Error('Expected the first relic to equip.');
		}
		const swapped = equipItem(first.state, 'charm', ward, canEquip);
		expect(swapped.status).toBe('success');
		if (swapped.status !== 'success') {
			return;
		}
		expect(swapped.state.equipment.slots.charm).toBe(ward);
		expect(swapped.item).toBe(ward);
		expect(swapped.displacedItem).toBe(relic);
		expect(swapped.events).toEqual([
			{type: 'unequipped', slot: 'charm', item: relic},
			{type: 'equipped', slot: 'charm', item: ward},
		]);

		const unequipped = unequipItem(swapped.state, 'charm');
		expect(unequipped.status).toBe('success');
		if (unequipped.status === 'success') {
			expect(unequipped.state.equipment.slots.charm).toBeUndefined();
			expect(unequipped.item).toBe(ward);
		}
	});

	it('rejects invalid slots or items without changing input state', () => {
		const state = createState();
		const invalidSlot = equipItem(state, 'unknown', relic, canEquip);
		const invalidItem = equipItem(state, 'charm', invalidRelic, canEquip);
		const notEquipped = unequipItem(state, 'charm');

		expect(invalidSlot.status).toBe('failure');
		expect(invalidItem.status).toBe('failure');
		expect(notEquipped.status).toBe('failure');
		if (invalidSlot.status === 'failure') {
			expect(invalidSlot.state).toBe(state);
			expect(invalidSlot.reason).toBe('invalid-slot');
		}
		if (invalidItem.status === 'failure') {
			expect(invalidItem.state).toBe(state);
			expect(invalidItem.reason).toBe('invalid-item');
		}
		if (notEquipped.status === 'failure') {
			expect(notEquipped.state).toBe(state);
			expect(notEquipped.reason).toBe('empty-slot');
		}
		expect(state.equipment.slots.charm).toBeUndefined();
	});
});
