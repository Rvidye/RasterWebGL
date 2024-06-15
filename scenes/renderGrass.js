"use strict"

var grassRenderScene = {


};

const eventIDSRenderGrass = {
    START_T: 0,
    MOVE_T: 1,
    END_T: 2
};

class renderGrass extends Scene {
    constructor() {
        super();
        this.isComplete = false;

        //Grass Rendering class object
        this.myGrass = new grass(500, 500, 600);

        //Atmospheric Scattering Class Object
        this.myAtmScat = new atmScattering();

    }
    setupProgram() {

        this.myGrass.setupProgram();
    }

    setupCamera() {
        // Setup All Cameras here
    }

    init() {


        const bladePos1 = [];

        for (let i = 0; i < this.myGrass.NUM_GRASS_BLADES_X; i++) {
            const x = (i / this.myGrass.NUM_GRASS_BLADES_X) - 0.5;
            for (let j = 0; j < this.myGrass.NUM_GRASS_BLADES_Y; j++) {
                const y = (j / this.myGrass.NUM_GRASS_BLADES_Y) - 0.5;
                //console.log(x * this.myGrass.GRASS_PATCH_SIZE + " " + y * this.myGrass.GRASS_PATCH_SIZE);
                bladePos1.push(x * this.myGrass.GRASS_PATCH_SIZE + Math.random() * 0.8 - 0.4);
                bladePos1.push(0);
                bladePos1.push(y * this.myGrass.GRASS_PATCH_SIZE + Math.random() * 0.8 - 0.4);
            }
        }

        this.myGrass.init(bladePos1);

        this.myAtmScat.initAtmScattering();
        this.lightManager = new LightManager();

    }

    renderShadow(shadowProgram){

    }

    render() {

        gl.depthMask(false);
        this.myAtmScat.renderAtmScattering();
        gl.depthMask(true);
        this.myGrass.render();
    }

    update() {

        this.myAtmScat.updateAtmScattering();
        this.myGrass.update();
    }

    renderUI(){
        switch(DEBUGMODE){
            case MODEL:
                //tutorialScene.modelPlacer.renderUI();
            break;
            case CAMERA:
                //cameraRig.renderUI();
            break;
            case LIGHT:
                this.lightManager.renderUI();
            break;
            case NONE:
            break;
        }
    }

    reset() {
        // reset stuff like timers and events
    }

    unint() {
        // clean eveything created in init
    }

    keyboardfunc(key) {

    }

    getCamera() {
        // return camera created in setupCameras;
    }

    isCompleted() {
        return this.isComplete;
    }
}
