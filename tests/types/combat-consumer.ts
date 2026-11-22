import {resolveCombat} from 'rot-next.js/addons/combat/combat.js';

interface CustomCombatant {
	readonly id: string;
	readonly hp: number;
	readonly faction: 'allies' | 'enemies';
	readonly shield: number;
}

const ranger: CustomCombatant = {
	id: 'ranger',
	hp: 16,
	faction: 'allies',
	shield: 2,
};
const slime: CustomCombatant = {
	id: 'slime',
	hp: 5,
	faction: 'enemies',
	shield: 0,
};
const result = resolveCombat({
	attacker: ranger,
	target: slime,
	action: {damage: 3},
	context: {minimumDamage: 1},
});
const remainingHp: number = result.remainingHp;
const eventTypes: readonly ('damaged' | 'defeated')[] = result.events.map(event => event.type);
void [remainingHp, eventTypes];
