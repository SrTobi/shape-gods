import {State} from './app';
import {LoadState} from './loadstate';
import {GameState} from './gamestate';

export interface Resources {
    bunny: PIXI.Texture
}


export class ResourceLoaderState extends LoadState {

    constructor() {
        super();
    }

    load(loader: PIXI.loaders.Loader): void {
        loader.add("bunny", "assets/bunny.png");
    }

    loaded(loader: PIXI.loaders.Loader, resources: any): State {
        return new GameState(<Resources>resources);
    }

}