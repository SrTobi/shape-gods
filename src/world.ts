import * as PIXI from 'pixi.js';
import {Resources} from './resources';

export abstract class Tile extends PIXI.Container {
    abstract isWalkable(): boolean;
    abstract isStatic(): boolean;

    update(dt: number): void {}
}

class Wall extends Tile {

    constructor(img: PIXI.Sprite) {
        super();
        this.addChild(img);
    }

    isWalkable(): boolean {
        return false;
    }

    isStatic(): boolean {
        return true;
    }
}

class Ground extends Tile {
    constructor(img: PIXI.Sprite) {
        super();
        this.addChild(img);
    }

    isWalkable(): boolean {
        return true;
    }

    isStatic(): boolean {
        return true;
    }
}

export class World extends PIXI.Container {

    private dynamicTiles: Tile[] = [];

    constructor(
        public width: number,
        public height: number,
        private tiles: Tile[][]) {

        super();

        for(let x = 0; x < width; ++x) {
            for(let y = 0; y < height; ++y) {
                const tile = this.at(x, y);
                this.addChild(tile);

                if(!tile.isStatic()) {
                    this.dynamicTiles.push(tile);
                }
            }
        }
    }

    setView(x: number, y: number, width: number, height: number) {
        
    }

    at(x: number, y: number): Tile {
        return this.tiles[x][y];
    }

    update(dt: number): void {
        this.dynamicTiles.forEach(tile => tile.update(dt));
    }
}

export class WorldGenerator {
    constructor(
        private width: number,
        private height: number,
        private resources: Resources) {

    }

    buildWorld(): World {
        let tiles: Tile[][] = [];
        let groundTex = this.resources.tiles.ground;
        let wallTex = this.resources.tiles.wall;

        let mkSprite = (tex: PIXI.Texture) => {
            let sprite = new PIXI.Sprite(tex);
            sprite.scale.x = 1/sprite.width;
            sprite.scale.y = 1/sprite.height;
            return sprite;
        }

        for(let x = 0; x < this.width; ++x) {
            tiles[x] = [];
            for(let y = 0; y < this.height; ++y) {
                let tile: Tile;

                if(x == 0 || x == this.width - 1 || y == 0 || y == this.height - 1) {
                    tile = new Wall(mkSprite(wallTex));    
                } else {
                    tile = new Ground(mkSprite(groundTex));
                }
                tile.x = x;
                tile.y = y;

                tiles[x][y] = tile;
            }
        }

        return new World(this.width, this.height, tiles);
    }
}