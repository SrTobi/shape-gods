
import * as PIXI from 'pixi.js';
import {App} from './app';
import {ResourceLoaderState} from './resources';

const app = new App(document.body, 60);
app.run(new ResourceLoaderState());