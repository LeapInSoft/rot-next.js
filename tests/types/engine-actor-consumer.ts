import {Engine, Scheduler, type EngineActor} from 'rot-next.js';
import type {TurnActor} from 'rot-next.js/addons/turns/actor.js';

interface SpeedTurnActor extends EngineActor {
	getSpeed(): number;
}

const synchronousActor: EngineActor = {
	act() {},
};
const addonActor: TurnActor = synchronousActor;

const asynchronousActor: EngineActor = {
	async act() {},
};

const scheduler = new Scheduler.Simple<EngineActor>();
scheduler.add(synchronousActor, true);
scheduler.add(asynchronousActor, true);
new Engine(scheduler);

const speedActor: SpeedTurnActor = {
	getSpeed: () => 100,
	act() {},
};
const speedScheduler = new Scheduler.Speed<SpeedTurnActor>();
speedScheduler.add(speedActor, true);
new Engine(speedScheduler);

void addonActor;
