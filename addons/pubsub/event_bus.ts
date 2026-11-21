interface TypedEvent {
	readonly type: string;
}

type EventHandler = (event: unknown) => unknown;

export class TypedEventBus<TEvent extends TypedEvent> {
	private readonly handlers = new Map<string, Set<EventHandler>>();

	subscribe<TType extends TEvent['type']>(
		type: TType,
		handler: (event: Extract<TEvent, {readonly type: TType}>) => unknown,
	): () => void {
		const subscribedHandlers = this.handlers.get(type) ?? new Set<EventHandler>();
		if (!this.handlers.has(type)) {
			this.handlers.set(type, subscribedHandlers);
		}

		const wrappedHandler: EventHandler = event => {
			if (typeof event === 'object' && event !== null && Reflect.get(event, 'type') === type) {
				// Runtime narrowing confirms that event belongs to the subscribed type.
				handler(event as Extract<TEvent, {readonly type: TType}>);
			}
		};
		subscribedHandlers.add(wrappedHandler);

		return () => {
			subscribedHandlers.delete(wrappedHandler);
		};
	}

	emit(event: TEvent): void {
		const handlers = this.handlers.get(event.type);
		if (!handlers) {
			return;
		}
		handlers.forEach(handler => {
			handler(event);
		});
	}

	clear(): void {
		this.handlers.clear();
	}
}
