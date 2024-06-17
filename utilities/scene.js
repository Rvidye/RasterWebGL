"use strict"

class Scene{

    constructor() {
        if (new.target === Scene) {
            throw new TypeError("Cannot construct SceneBase instances directly");
        }
        this.lightManager = null;
    }

    setupProgram() { throw new Error("Must implement setupProgram"); }
    setupCamera() { throw new Error("Must implement setupCamera"); }
    init() { throw new Error("Must implement init"); }
    render() { throw new Error("Must implement render"); }
    renderShadow(shadowProgram) { throw new Error("Must implement renderShadow"); }
    renderUI() { throw new Error("Must implement render UI"); }
    getSceneTime() {throw new Error("Must implement getSceneTime");}
    update() { throw new Error("Must implement update"); }
    reset() { throw new Error("Must implement reset"); }
    unint() { throw new Error("Must implement unint"); }
    keyboardfunc(key) { throw new Error("Must implement keyboardfunc"); }
    getCamera() { throw new Error("Must implement getCamera"); }
    isCompleted() { throw new Error("Must implement isCompleted"); }
};

