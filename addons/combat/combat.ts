export interface CombatantIdentity {
	readonly id: string;
}

export interface Combatant extends CombatantIdentity {
	readonly hp: number;
}

export interface CombatAction {
	readonly damage: number;
}

export interface CombatContext {
	readonly minimumDamage?: number;
}

export interface CombatResolution {
	readonly attacker: CombatantIdentity;
	readonly target: Combatant;
	readonly action: CombatAction;
	readonly context?: CombatContext;
}

export type CombatEvent =
	| {
			readonly type: 'damaged';
			readonly attackerId: string;
			readonly targetId: string;
			readonly damage: number;
		}
	| {
			readonly type: 'defeated';
			readonly combatantId: string;
			readonly defeatedBy: string;
		};

export interface CombatResult {
	readonly damage: number;
	readonly remainingHp: number;
	readonly defeated: boolean;
	readonly events: readonly CombatEvent[];
}

export function resolveCombat({attacker, target, action, context = {}}: CombatResolution): CombatResult {
	const damage = Math.max(0, context.minimumDamage ?? 0, action.damage);
	const remainingHp = Math.max(0, target.hp - damage);
	const defeated = remainingHp === 0;
	const events: CombatEvent[] = damage > 0
		? [{type: 'damaged', attackerId: attacker.id, targetId: target.id, damage}]
		: [];
	if (target.hp > 0 && defeated) {
		events.push({type: 'defeated', combatantId: target.id, defeatedBy: attacker.id});
	}

	return {damage, remainingHp, defeated, events};
}
