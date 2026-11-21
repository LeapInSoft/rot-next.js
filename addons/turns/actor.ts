export interface TurnActor {
	act(): void | Promise<void>;
}

export interface TurnScheduler<TActor extends TurnActor> {
	add(actor: TActor, repeat: boolean): unknown;
}

export function registerTurnActor<TActor extends TurnActor>(
	scheduler: TurnScheduler<TActor>,
	actor: TActor,
): unknown {
	return scheduler.add(actor, true);
}
