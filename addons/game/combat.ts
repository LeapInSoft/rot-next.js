import type {Monster, Player} from './types.js';

export interface CombatResult {
	readonly player: Player;
	readonly monster: Monster;
	readonly messages: readonly string[];
	readonly monsterDefeated: boolean;
}

export function attackMonster(player: Player, monster: Monster): CombatResult {
	const damage = player.attack + (player.equipment.weapon?.attack ?? 0);
	const hp = Math.max(0, monster.hp - damage);
	const alive = hp > 0;
	const messages = [`${player.name} hits ${monster.name} for ${damage} damage.`];
	const updatedPlayer = alive
		? player
		: {...player, xp: player.xp + monster.xpReward};
	const updatedMonster = {...monster, hp, alive};
	if (!alive) {
		messages.push(`${monster.name} dies. ${player.name} gains ${monster.xpReward} XP.`);
	}

	return {player: updatedPlayer, monster: updatedMonster, messages, monsterDefeated: !alive};
}

export interface PlayerAttackResult {
	readonly player: Player;
	readonly messages: readonly string[];
}

export function attackPlayer(player: Player, monster: Monster): PlayerAttackResult {
	const damage = Math.max(1, monster.attack - (player.equipment.armor?.defense ?? 0));
	const hp = Math.max(0, player.hp - damage);
	const alive = hp > 0;
	const messages = [`${monster.name} hits ${player.name} for ${damage} damage.`];
	if (!alive) {
		messages.push(`${player.name} falls in battle.`);
	}

	return {player: {...player, hp, alive}, messages};
}
