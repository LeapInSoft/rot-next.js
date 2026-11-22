import {createEquipment, equipItem, unequipItem} from 'rot-next.js/addons/equipment/equipment.js';
import type {Item} from 'rot-next.js/addons/items/items.js';

interface CustomRelic extends Item {
	readonly bonus: number;
}

interface CustomState {
	readonly equipment: ReturnType<typeof createEquipment<CustomRelic>>;
	readonly questFlags: Readonly<Record<string, boolean>>;
}

const relic: CustomRelic = {id: 'ember', name: 'Ember Relic', bonus: 4};
const state: CustomState = {
	equipment: createEquipment<CustomRelic>(['charm', 'ward']),
	questFlags: {foundRelic: true},
};
const equipped = equipItem(state, 'charm', relic, (_current, item) => item.bonus > 0);
if (equipped.status === 'success') {
	const bonus: number = equipped.state.equipment.slots.charm?.bonus ?? 0;
	const questFlag: boolean = equipped.state.questFlags.foundRelic;
	const displaced: CustomRelic | undefined = equipped.transition === 'equipped'
		? equipped.displacedItem
		: undefined;
	const unequipped = unequipItem<CustomRelic, CustomState>(equipped.state, 'charm');
	if (unequipped.status === 'success') {
		const removedItem: CustomRelic = unequipped.item;
		void [removedItem, unequipped.events];
	}
	void [bonus, questFlag, displaced];
}
