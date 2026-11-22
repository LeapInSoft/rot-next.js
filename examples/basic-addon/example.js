import { Display } from "../../lib/index.js";
import { ComponentRegistry, EntityRegistry } from "../../lib/addons/entities/registry.js";
import { createInitialGameState, transitionGame } from "../../lib/addons/game/game.js";
import { gameActionForKey } from "../../lib/addons/game/controls.js";
import { TypedEventBus } from "../../lib/addons/pubsub/event_bus.js";
import { TextBuffer } from "../../lib/addons/text/text_buffer.js";
import { registerTurnActor } from "../../lib/addons/turns/actor.js";

const displayOptions = {width: 38, height: 17};
const mapOptions = {width: 11, height: 9, top: 1};
export function createBasicAddonScene() {
	const display = new Display(displayOptions);
	document.body.appendChild(display.getContainer());

	const entities = new EntityRegistry();
	const positions = new ComponentRegistry();
	const events = new TypedEventBus();
	const messages = new TextBuffer(3);
	const hero = {id: "hero", name: "Ada"};
	const goblin = {id: "goblin", name: "Goblin"};
	entities.add(hero);
	entities.add(goblin);

	let state = createInitialGameState();
	positions.set({entityId: hero.id, ...state.player.position});
	positions.set({entityId: goblin.id, ...state.monster.position});

	const updatePositions = () => {
		positions.set({entityId: hero.id, ...state.player.position});
		positions.set({entityId: goblin.id, ...state.monster.position});
	};

	const drawScene = () => {
		for (let x = 0; x < mapOptions.width; x++) {
			for (let y = 0; y < mapOptions.height; y++) {
				// side-effect: draw the room into the display.
				const isBorder = x === 0
					|| y === 0
					|| x + 1 === mapOptions.width
					|| y + 1 === mapOptions.height;
				const screenY = y + mapOptions.top;
				isBorder
					? display.draw(x, screenY, "#", "gray")
					: display.draw(x, screenY, ".", "#666");
			}
		}

		state.groundLoot.forEach(({position}) => {
			display.draw(position.x, position.y + mapOptions.top, "!", "chartreuse");
		});

		const playerPosition = positions.get(hero.id);
		const monsterPosition = positions.get(goblin.id);
		if (playerPosition && state.player.alive) {
			display.draw(playerPosition.x, playerPosition.y + mapOptions.top, "@", "goldenrod");
		}
		if (monsterPosition && state.monster.alive) {
			display.draw(monsterPosition.x, monsterPosition.y + mapOptions.top, "g", "orangered");
		}

		const {player, monster} = state;
		display.drawText(13, 1, "<b>THE GOBLIN CAVE</b>");
		display.drawText(13, 3, `Ada  HP ${player.hp}/${player.maxHp}`);
		display.drawText(13, 4, `XP ${player.xp}   Turns ${state.turn}`);
		display.drawText(13, 6, `Weapon: ${player.equipment.weapon?.name ?? "none"}`);
		display.drawText(13, 7, `Armor:  ${player.equipment.armor?.name ?? "none"}`);
		display.drawText(13, 9, `Goblin: ${monster.alive ? `${monster.hp} HP` : "defeated"}`);
		display.drawText(13, 11, "Items:");
		const inventory = player.inventory.length
			? player.inventory.map(({name}) => name).join(", ")
			: "(empty)";
		display.drawText(13, 12, inventory);
		display.drawText(0, 12, "Messages:");
		messages.getLines().forEach((message, index) => {
			display.drawText(0, 13 + index, message);
		});
	};

	const gameActor = {
		act(action) {
			const transition = transitionGame(state, action);
			state = transition.state;
			updatePositions();
			transition.messages.forEach(message => events.emit({type: "message", message}));
			events.emit({type: "updated"});
		},
	};

	events.subscribe("message", event => {
		messages.append(event.message);
	});
	events.subscribe("updated", () => {
		drawScene();
	});

	const scheduler = {
		add() {
			return this;
		},
	};
	registerTurnActor(scheduler, gameActor);

	const handleKeyDown = event => {
		// side-effect: translate keyboard input into a game action.
		const action = gameActionForKey(event.key, state.player.inventory);
		if (action) {
			event.preventDefault();
			gameActor.act(action);
		}
	};
	document.addEventListener("keydown", handleKeyDown);

	messages.append("Find the goblin. Move with the arrow keys.");
	drawScene();

	return {
		display,
		entities,
		positions,
		events,
		messages,
		getState: () => state,
		act: action => gameActor.act(action),
		destroy() {
			document.removeEventListener("keydown", handleKeyDown);
			display.getContainer().remove();
		},
	};
}

export const basicAddonScene = typeof document === "undefined"
	? undefined
	: createBasicAddonScene();
