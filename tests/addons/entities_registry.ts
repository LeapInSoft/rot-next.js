import { describe, expect, it } from 'vitest';

import { ComponentRegistry, EntityRegistry } from '@/addons/entities/registry.js';

describe('entity registry addon', () => {
	it('registers entities and their components without mutating the entity model', () => {
		interface TestEntity {
			readonly id: string;
			readonly name: string;
		}
		interface PositionComponent {
			readonly entityId: string;
			readonly x: number;
			readonly y: number;
		}

		const entities = new EntityRegistry<TestEntity>();
		const positions = new ComponentRegistry<PositionComponent>();
		const hero: TestEntity = {id: 'hero', name: 'Ada'};

		entities.add(hero);
		positions.set({entityId: 'hero', x: 4, y: 9});

		expect(entities.get('hero')).toBe(hero);
		expect(entities.getAll()).toEqual([hero]);
		expect(positions.get('hero')).toEqual({entityId: 'hero', x: 4, y: 9});

		expect(() => entities.add(hero)).toThrowError('Entity hero is already registered');
	});
});
