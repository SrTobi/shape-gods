import {State} from './app';
import {Resources} from './resources';


export class GameState implements State {

    constructor(private resources: Resources) {
        console.log("Loaded!!!");
    }

    enter(prev: State, renderer: PIXI.SystemRenderer): void {

    }

    leave(next: State): void {

    }

    update(dt: number): State | null {
        return null;
    }

    render(dt: number): PIXI.Container | null {
        return null;
    }
}