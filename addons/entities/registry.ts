export interface IdentifiedEntity {
	readonly id: string;
}

export class EntityRegistry<TEntity extends IdentifiedEntity> {
	private readonly entities = new Map<string, TEntity>();

	add(entity: TEntity): void {
		if (this.entities.has(entity.id)) {
			throw new Error(`Entity ${entity.id} is already registered`);
		}
		this.entities.set(entity.id, entity);
	}

	get(id: string): TEntity | undefined {
		return this.entities.get(id);
	}

	getAll(): TEntity[] {
		return Array.from(this.entities.values());
	}

	remove(id: string): boolean {
		return this.entities.delete(id);
	}

	clear(): void {
		this.entities.clear();
	}
}

export interface EntityComponent {
	readonly entityId: string;
}

export class ComponentRegistry<TComponent extends EntityComponent> {
	private readonly components = new Map<string, TComponent>();

	set(component: TComponent): void {
		this.components.set(component.entityId, component);
	}

	get(entityId: string): TComponent | undefined {
		return this.components.get(entityId);
	}

	remove(entityId: string): boolean {
		return this.components.delete(entityId);
	}

	getAll(): TComponent[] {
		return Array.from(this.components.values());
	}
}
