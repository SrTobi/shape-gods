import * as PIXI from 'pixi.js';
import {Entity} from './entity';

export class Creature extends Entity {
    
    private body = new PIXI.Graphics();

    constructor() {
        super();

        let g = this.body;
        g.lineStyle(1, 0x000000, 0.7);
        g.beginFill(0x010101);
        g.drawCircle(0, 0, 3);

        
        g.drawCircle(6, 0, 1);
        g.drawCircle(-6, 0, 1);

        g.endFill();
        this.scale.x = 1/20;
        this.scale.y = 1/20;
        this.addChild(this.body);
    }

    update(dt: number): void {

    }
}