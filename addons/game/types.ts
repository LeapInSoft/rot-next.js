import type {GridCoordinate} from '../core/grid.js';

export type {GridCoordinate} from '../core/grid.js';

export type Direction = 'north' | 'south' | 'east' | 'west';

export interface PotionItem {
	readonly id: string;
	readonly name: string;
	readonly type: 'potion';
	readonly healing: number;
}

export interface WeaponItem {
	readonly id: string;
	readonly name: string;
	readonly type: 'weapon';
	readonly attack: number;
}

export interface ArmorItem {
	readonly id: string;
	readonly name: string;
	readonly type: 'armor';
	readonly defense: number;
}

export type GameItem = PotionItem | WeaponItem | ArmorItem;

export interface Equipment {
	readonly weapon: WeaponItem | null;
	readonly armor: ArmorItem | null;
}

export interface Player {
	readonly id: string;
	readonly name: string;
	readonly position: GridCoordinate;
	readonly hp: number;
	readonly maxHp: number;
	readonly attack: number;
	readonly xp: number;
	readonly alive: boolean;
	readonly inventory: readonly GameItem[];
	readonly equipment: Equipment;
}

export interface Monster {
	readonly id: string;
	readonly name: string;
	readonly position: GridCoordinate;
	readonly hp: number;
	readonly attack: number;
	readonly xpReward: number;
	readonly drops: readonly GameItem[];
	readonly alive: boolean;
}

export interface GroundItem {
	readonly item: GameItem;
	readonly position: GridCoordinate;
}

export interface GameState {
	readonly turn: number;
	readonly player: Player;
	readonly monster: Monster;
	readonly groundLoot: readonly GroundItem[];
}

export type GameAction =
	| {readonly type: 'move'; readonly direction: Direction}
	| {readonly type: 'wait'}
	| {readonly type: 'pickup'}
	| {readonly type: 'use'; readonly itemId: string}
	| {readonly type: 'equip'; readonly itemId: string};

export interface GameTransition {
	readonly state: GameState;
	readonly messages: readonly string[];
}
