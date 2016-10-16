import * as PIXI from 'pixi.js';
import {Entity} from './entity';

export class Creature extends Entity {
    
    private body = new PIXI.Graphics();

    constructor() {
        super();

        let g = this.body;
        g.lineStyle(0);
        g.beginFill(0x010101);
        g.drawCircle(0, 0, 0.2);

        
        g.drawCircle(0.3, 0, 0.05);
        g.drawCircle(-0.3, 0, 0.05);

        g.endFill();
        this.addChild(this.body);
    }

    update(dt: number): void {

    }
}