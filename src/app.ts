
import * as PIXI from 'pixi.js';
import * as Utils from './utils';


export interface State {
    enter(prev: State, renderer: PIXI.SystemRenderer): void;
    leave(next: State): void;

    update(dt: number): State | null;
    render(dt: number): PIXI.Container | null;
}

export class App {

    private renderer: PIXI.SystemRenderer;
    private lastUpdate: number;
    private currentState: State;

    constructor(parent: HTMLElement, private targetFPS: number) {

        this.renderer = PIXI.autoDetectRenderer(800, 600, {backgroundColor: 0x000000});
        parent.appendChild(this.renderer.view);
    }

    public run(state: State) {
        this.setState(state);
        this.lastUpdate = Date.now();
        this.onFrame();
    }

    private setState(nextState: State) {
        let prevState = this.currentState;
        if(prevState) {
            prevState.leave(nextState);
        }
        this.currentState = nextState;
        if(nextState) {
            nextState.enter(prevState, this.renderer);
        }
    }

    private onFrame() {
        let now = Date.now();
        let dt = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        if(this.currentState) {
            // render
            let stage = this.currentState.render(dt);
            if(stage) {
                this.renderer.render(stage);
            }

            // update
            let nextState = this.currentState.update(dt);
            if(nextState) {
                this.setState(nextState);
            }

            // reqest next frame
            requestAnimationFrame(this.onFrame.bind(this));
        }
    }
}