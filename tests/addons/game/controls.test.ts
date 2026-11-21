import {describe, expect, it} from 'vitest';

import {gameActionForKey} from '@/addons/game/controls.js';
import type {GameItem} from '@/addons/game/game.js';

const inventory: readonly GameItem[] = [
	{id: 'potion', name: 'healing potion', type: 'potion', healing: 8},
	{id: 'sword', name: 'iron sword', type: 'weapon', attack: 5},
	{id: 'armor', name: 'iron armor', type: 'armor', defense: 2},
];

describe('game controls', () => {
	it('maps movement, wait, and pickup keys to actions', () => {
		expect(gameActionForKey('ArrowUp', [])).toEqual({type: 'move', direction: 'north'});
		expect(gameActionForKey(' ', [])).toEqual({type: 'wait'});
		expect(gameActionForKey('g', [])).toEqual({type: 'pickup'});
		expect(gameActionForKey('x', [])).toBeUndefined();
	});

	it('selects a potion or equipment item from the inventory', () => {
		expect(gameActionForKey('1', inventory)).toEqual({type: 'use', itemId: 'potion'});
		expect(gameActionForKey('2', inventory)).toEqual({type: 'equip', itemId: 'sword'});
		expect(gameActionForKey('3', inventory)).toEqual({type: 'equip', itemId: 'armor'});
		expect(gameActionForKey('1', [])).toBeUndefined();
	});
});
