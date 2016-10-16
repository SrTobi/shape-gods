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

class Interval {
    private _min: number;
    private _max: number;

    constructor(begin: number, end: number) {
        this._min = Math.min(begin, end);
        this._max = Math.max(begin, end);
    }

    min(): number {
        return this._min;
    }

    max(): number {
        return this._max;
    }

    size(): number {
        return this.max() - this.min() + 1; // max is inclusive!
    }

    intersects(other: Interval) {
        return Math.min(this.max(), other.max()) >= Math.max(this.min(), other.min());
    }

    rand(): number {
        return this.min() + Math.floor(this.size() * Math.random());
    }

    hull(other: Interval): Interval {
        return new Interval(Math.min(this.min(), other.min()), Math.max(this.max(), other.max()));
    }
}

abstract class RoomType {
    abstract width(): Interval;
    abstract height(): Interval;

    abstract topDoors(): Interval[];
    abstract bottomDoors(): Interval[];
    abstract leftDoors(): Interval[];
    abstract rightDoors(): Interval[];
}

class Sector {
    topNeighbours: Sector[] = [];
    bottomNeighbours: Sector[] = [];
    leftNeighbours: Sector[] = [];
    rightNeigbours: Sector[] = [];

    constructor(public horizontalBounds: Interval, public verticalBounds: Interval) {

    }

    width(): number {
        return this.horizontalBounds.size();
    }

    height(): number {
        return this.verticalBounds.size();
    }

    canSplitHorizontally(minSectorWidth: number): boolean {
        return this.width() >= minSectorWidth * 2 + 1;
    }
    
    canSplitVertically(minSectorHeight: number): boolean {
        return this.height() >= minSectorHeight * 2 + 1;
    }

    canSplit(minSectorWidth: number, minSectorHeight: number): boolean {
        return this.canSplitHorizontally(minSectorWidth) || this.canSplitVertically(minSectorHeight);
    }

    split(minSectorWidth: number, minSectorHeight: number): Sector[] {
        if(!this.canSplit(minSectorWidth, minSectorHeight)) {
            return [this];
        }

        if(this.canSplitHorizontally(minSectorWidth) && Math.random() > 0.5 || !this.canSplitVertically(minSectorHeight)) {
            return this.splitHorizontally(minSectorWidth);
        }else{
            return this.splitVertically(minSectorHeight);
        }
    }

    public splitHorizontally(minSectorWidth: number): Sector[] {
        let space = this.width() - 1; // 1 tile wall
        let sizeBounds = new Interval(minSectorWidth, space - minSectorWidth);
        let rightSize = sizeBounds.rand();
        let leftSize = space - rightSize;

        let hMin = this.horizontalBounds.min();
        let hMax = this.horizontalBounds.max();
        let left = new Sector(new Interval(hMin, hMin + leftSize - 1), this.verticalBounds);
        let right = new Sector(new Interval(hMax - rightSize + 1, hMax), this.verticalBounds);

        // neighbour check
        let neighboursFrom = (ref: Sector, list: Sector[]) => list.filter(n => ref.horizontalBounds.intersects(n.horizontalBounds));

        // adjust neighbours
        left.rightNeigbours = [right];
        left.leftNeighbours = this.leftNeighbours;
        left.topNeighbours = neighboursFrom(left, this.topNeighbours);
        left.bottomNeighbours = neighboursFrom(left, this.topNeighbours);

        right.leftNeighbours = [left];
        right.rightNeigbours = this.rightNeigbours;
        right.topNeighbours = neighboursFrom(right, this.topNeighbours);
        right.bottomNeighbours = neighboursFrom(right, this.topNeighbours);

        return [left, right];
    }

    public splitVertically(minSectorHeight: number): Sector[] {
        if(!this.canSplitVertically(minSectorHeight)) {
            console.log("cant split!!!!");
        }
        let space = this.height() - 1; // 1 tile wall
        let sizeBounds = new Interval(minSectorHeight, space - minSectorHeight);
        let topSize = sizeBounds.rand();
        let bottomSize = space - topSize;

        let vMin = this.verticalBounds.min();
        let vMax = this.verticalBounds.max();
        let top = new Sector(this.horizontalBounds, new Interval(vMin, vMin + topSize - 1));
        let bottom = new Sector(this.horizontalBounds, new Interval(vMax - bottomSize + 1, vMax));

        // neighbour check
        let neighboursFrom = (ref: Sector, list: Sector[]) => list.filter(n => ref.verticalBounds.intersects(n.verticalBounds));

        // adjust neighbours
        top.bottomNeighbours = [bottom];
        top.topNeighbours = this.topNeighbours;
        top.rightNeigbours = neighboursFrom(top, this.rightNeigbours);
        top.leftNeighbours = neighboursFrom(top, this.leftNeighbours);
        
        bottom.topNeighbours = [top];
        bottom.bottomNeighbours = this.bottomNeighbours;
        bottom.rightNeigbours = neighboursFrom(bottom, this.rightNeigbours);
        bottom.leftNeighbours = neighboursFrom(bottom, this.leftNeighbours);
        
        return [top, bottom];
    }

    neighbours(): Sector[] {
        return this.topNeighbours.concat(this.bottomNeighbours, this.leftNeighbours, this.rightNeigbours);
    }
}

export class WorldGenerator {

    roomTypes: RoomType[];

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

    buildWorld2(): World {

        const minSectorWidth = 2;
        const minSectorHeight = 2;
        // create a single sector
        let sectors = [new Sector(new Interval(1, this.width - 2), new Interval(1, this.height - 2))];

        let maxSplitTrys = 100;

        while(maxSplitTrys-- > 0) {
            // split a random sector 
            let secIdx = Math.floor(Math.random() * sectors.length);
            let sector = sectors[secIdx];

            if(sector.canSplit(minSectorWidth, minSectorHeight)) {
                sectors.splice(secIdx, 1);
                let newSecs = sector.split(minSectorWidth, minSectorHeight);
                sectors.push(...newSecs);
            }
        }


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
                let tile = new Wall(mkSprite(wallTex));
                tile.x = x;
                tile.y = y;

                tiles[x][y] = tile;
            }
        }

        for(let sector of sectors) {
            for(let x = sector.horizontalBounds.min(); x <= sector.horizontalBounds.max(); ++x) {
                for(let y = sector.verticalBounds.min(); y <= sector.verticalBounds.max(); ++y) {
                    let tile = new Ground(mkSprite(groundTex));
                    tile.x = x;
                    tile.y = y;

                    tiles[x][y] = tile;
                }
            }
        }

        return new World(this.width, this.height, tiles);
    }
}