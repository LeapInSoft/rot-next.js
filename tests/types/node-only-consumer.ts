import { Display, Path, RNG } from 'rot-next.js';

RNG.getUniform();
new Path.AStar(1, 1, () => true).compute(0, 0, () => {});
new Display().destroy();
