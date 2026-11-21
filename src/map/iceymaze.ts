import { Map } from '@/src/map/map.js';
import type { CreateCallback } from '@/src/map/map.js';
import { RNG } from '@/src/rng.js';

/**
 * Icey's Maze generator
 * See http://roguebasin.com/index.php/Simple_maze for explanation
 */
export class IceyMaze extends Map {
	regularity: number;
	map: number[][];

	constructor(width: number, height: number, regularity = 0) {
		super(width, height);
		this.regularity = regularity;
		this.map = [];
	}

	create(callback?: CreateCallback) {
		if (this.width < 3 || this.height < 3) { return null; }

		let width = this.width;
		let height = this.height;
		const map = this.fillMap(1);
		
		width -= (width % 2 ? 1 : 2);
		height -= (height % 2 ? 1 : 2);

		let cx = 0;
		let cy = 0;
		let nx = 0;
		let ny = 0;

		let done = 0;
		let blocked = false;
		const dirs = [
			[0, 0],
			[0, 0],
			[0, 0],
			[0, 0]
		];
		do {
			cx = 1 + 2*Math.floor(RNG.getUniform()*(width-1) / 2);
			cy = 1 + 2*Math.floor(RNG.getUniform()*(height-1) / 2);

			if (!done) { map[cx][cy] = 0; }
			
			if (!map[cx][cy]) {
				this.randomize(dirs);
				do {
					if (Math.floor(RNG.getUniform()*(this.regularity+1)) === 0) { this.randomize(dirs); }
					blocked = true;
					for (let i=0;i<4;i++) {
						nx = cx + dirs[i][0]*2;
						ny = cy + dirs[i][1]*2;
						if (this.isFree(map, nx, ny, width, height)) {
							map[nx][ny] = 0;
							map[cx + dirs[i][0]][cy + dirs[i][1]] = 0;
							
							cx = nx;
							cy = ny;
							blocked = false;
							done++;
							break;
						}
					}
				} while (!blocked);
			}
		} while (done+1 < width*height/4);
		
		if (callback) {
			for (let i=0;i<this.width;i++) {
				for (let j=0;j<this.height;j++) {
					callback(i, j, map[i][j]);
				}
			}
		}
		this.map = [];
		return this;
	}

	randomize(dirs: number[][]) {
		for (let i=0;i<4;i++) {
			dirs[i][0] = 0;
			dirs[i][1] = 0;
		}
		
		switch (Math.floor(RNG.getUniform()*4)) {
			case 0:
				dirs[0][0] = -1; dirs[1][0] = 1;
				dirs[2][1] = -1; dirs[3][1] = 1;
			break;
			case 1:
				dirs[3][0] = -1; dirs[2][0] = 1;
				dirs[1][1] = -1; dirs[0][1] = 1;
			break;
			case 2:
				dirs[2][0] = -1; dirs[3][0] = 1;
				dirs[0][1] = -1; dirs[1][1] = 1;
			break;
			case 3:
				dirs[1][0] = -1; dirs[0][0] = 1;
				dirs[3][1] = -1; dirs[2][1] = 1;
			break;
		}
	}

	isFree(map: number[][], x: number, y: number, width: number, height: number) {
		if (x < 1 || y < 1 || x >= width || y >= height) { return false; }
		return map[x][y];
	}
}
