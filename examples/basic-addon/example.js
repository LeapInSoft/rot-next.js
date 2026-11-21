import { Display } from "../../lib/index.js";
import { createGridCoordinate, gridKey } from "./addons/core/grid.js";
import { ComponentRegistry, EntityRegistry } from "./addons/entities/registry.js";
import { TypedEventBus } from "./addons/pubsub/event_bus.js";
import { TextBuffer } from "./addons/text/text_buffer.js";
import { registerTurnActor } from "./addons/turns/actor.js";

const displayOptions = {
	width: 21,
	height: 12
};

export function createBasicAddonScene() {
	const display = new Display(displayOptions);
	document.body.appendChild(display.getContainer());

	const entities = new EntityRegistry();
	const positions = new ComponentRegistry();
	const events = new TypedEventBus();
	const messages = new TextBuffer(1);
	const hero = {id: "hero", name: "Ada"};
	entities.add(hero);
	positions.set({entityId: hero.id, x: 10, y: 5});

	const drawScene = () => {
		for (let x = 0; x < displayOptions.width; x++) {
			for (let y = 0; y < displayOptions.height - 2; y++) {
				// side-effect: draw the room into the display.
				const isBorder = x === 0
					|| y === 0
					|| x + 1 === displayOptions.width
					|| y + 1 === displayOptions.height - 2;
				isBorder
					? display.draw(x, y, "#", "gray")
					: display.draw(x, y, ".", "#666");
			}
		}

		const position = positions.get(hero.id);
		if (position) {
			display.draw(position.x, position.y, "@", "goldenrod");
		}

		display.drawText(
			0,
			displayOptions.height - 1,
			messages.toString()
		);
	};

	const movement = {
		ArrowLeft: [-1, 0],
		ArrowRight: [1, 0],
		ArrowUp: [0, -1],
		ArrowDown: [0, 1]
	};

	const heroActor = {
		act(direction) {
			const position = positions.get(hero.id);
			if (!position || !direction) {
				return;
			}

			const [deltaX, deltaY] = direction;
			const nextPosition = createGridCoordinate(
				position.x + deltaX,
				position.y + deltaY
			);
			const isWall = nextPosition.x === 0
				|| nextPosition.y === 0
				|| nextPosition.x + 1 === displayOptions.width
				|| nextPosition.y + 1 === displayOptions.height - 2;
			if (isWall) {
				messages.append("A wall blocks the way.");
				drawScene();
				return;
			}

			positions.set({
				entityId: hero.id,
				x: nextPosition.x,
				y: nextPosition.y
			});
			events.emit({
				type: "moved",
				entityId: hero.id,
				position: nextPosition
			});
		}
	};

	events.subscribe("moved", event => {
		messages.append(`${event.entityId} moved to ${gridKey(event.position)}`);
		drawScene();
	});

	const scheduler = {
		add() {
			return this;
		}
	};
	registerTurnActor(scheduler, heroActor);

	document.addEventListener("keydown", event => {
		// side-effect: translate keyboard input into an addon actor action.
		const direction = movement[event.key];
		if (direction) {
			event.preventDefault();
			heroActor.act(direction);
		}
	});

	messages.append("Ada entered the room.");
	drawScene();

	return {display, entities, positions, events, messages};
}

if (typeof document !== "undefined") {
	createBasicAddonScene();
}
