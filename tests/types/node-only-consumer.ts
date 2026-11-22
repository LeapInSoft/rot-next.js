import {
	createInitialGameState,
} from 'rot-next.js/addons/game/game.js';
import {
	Arena,
	BaseMap,
	Backend,
	ComputeCallback,
	CreateCallback,
	Display,
	DisplayOptions,
	Dungeon,
	LightPassesCallback,
	PassableCallback,
	VisibilityCallback,
	Maps,
	Map as MapNamespace,
	Room,
	Path,
	RNG,
	createRNG,
	type RandomSource,
} from 'rot-next.js';

RNG.getUniform();
const randomSource: RandomSource = createRNG(1234);
randomSource.getUniform();
new Path.AStar(1, 1, () => true).compute(0, 0, () => {});
new Display().destroy();
const map: BaseMap = new Arena(20, 20);
const mapNamespace: typeof Maps = MapNamespace;
const displayOptions: DisplayOptions = new Display().getOptions();
const createMap: CreateCallback = (_x, _y, _contents) => {};
const callbacks: [ComputeCallback, LightPassesCallback, PassableCallback, VisibilityCallback] = [
	(_x, _y) => true,
	(_x, _y) => true,
	(_x, _y) => true,
	(_x, _y, _radius, _visibility) => {},
];
const dungeonType: Dungeon | null = null;
const roomType: Room | null = null;
const backend: Backend | null = null;
const addonState = createInitialGameState();
void [map, mapNamespace, displayOptions, createMap, callbacks, dungeonType, roomType, backend, addonState];
