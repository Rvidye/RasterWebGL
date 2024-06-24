"use strict"


var KangarooScene = {
    modelPlacer: null,
    sceneCamera: null,
    sceneCameraRig: null,
    timer: null,
    songStart: 0,
    programCelShader: null
};



const KangarooSceneEventIDS = {
    START_T: 0,
    MOVE_T: 1,
    END_T: 2
};

class kangarooScene extends Scene {

    constructor() {
        super();
        this.isComplete = false;

        //Lighting Setup
        this.lightManager = new LightManager();
        const directionalLight = new Light(0, [1.0, 1.0, 1.0], 1.0, [0, 400, 400], [0.0, -1.0, -1.0], 0.0, 0.0, 0.0, false);

        //For Ambient
        const directionalLight2 = new Light(0, [1.0, 1.0, 1.0], 0.15, [0, -400, -400], [0.0, -1.0, 1.0], 0.0, 0.0, 0.0, false);

        this.lightManager.addLight(directionalLight);
        this.lightManager.addLight(directionalLight2);



        //Grass Rendering class object
        this.myGrass = new grass(1500, 1500, 1500);

        //Atmospheric Scattering Class Object
        this.myAtmScat = new atmScattering();

        //Vegetation
        this.myVegetation = new vegetation();

        //Models(Terrain,Tree,Stones)
        this.myModelDraw = new drawModels();



        //Load Models
        //Terrain
        this.terrainScale = 1000.0;
        this.terrainModelName = "kangarooTerrain";
        this.terrainModel = setupModel(this.terrainModelName, false);
        this.terrainModelMatrixArray = [];
        this.terrainTextue = null;

        //Objects -> trees and stones
        this.objectsModel = setupModel("kangarooSceneObjects", false);

        //Mountains
        this.maountainsModel = setupModel("kangarooSceneMountains", false);

        this.whiteTexture = null;


        this.kangarooMother = setupModel("kangarooMother", false);
        this.kangarooMotherModelMatrix = [];

        this.kangarooBaby = setupModel("kangarooJoey", false);
        this.kangarooBabyModelMatrix = [];

        //  this.kangarooMother = setupModel("kangarooMother", true);
        //this.kangarooJoey = setupModel("kangarooJoey", true);

    }

    setupProgram() {
        KangarooScene.programCelShader = new ShaderProgram(gl, ['shaders/model/model.vert', 'shaders/model/celShader.frag']);

    }

    setupCamera() {

        // Setup All Cameras here
        // Setup All Cameras here
        const positionKeyFrames = [
            [-314, 30, -158],
            [-254, 15, -82],
            [-104, 12.799999999999898, -46],
            [87, 13.399999999999693, -120],
            [205, 53.29999999999958, -98],
            [231, 51.69999999999953, -14],
            [225, 57.899999999999615, 56],
            [133, 45.99999999999959, 100],
            [27, 8.799999999999544, -1.4999999999999716],
            [-35, 5.099999999999557, -46],
            [-40, 3.599999999999767, 7],
            [-85, 12, 90],
            [26, 17, 120],
            [66, 25, -4],
            [56, 38, -71],
            [-125, 13.19999999999969, -19],
            [-13, 6.799999999999557, 5.900000000000033]

        ];

        const frontKeyFrames = [
            [-308, 30, -148],
            [-248, 15, -77],
            [-98, 12.799999999999898, -46],
            [100, 15.399999999999693, -120],
            [188, 54.29999999999958, -76],
            [222, 51.69999999999953, -10],
            [166, 48.899999999999615, 101],
            [87, 31.999999999999588, 78],
            [-5, 3.1999999999995623, 3],
            [-9, 4.999999999999858, -1],
            [-26, 6, -2],
            [-36, 3, 33],
            [-34, 6, 54],
            [-22, 9, 38],
            [-10, 6.799999999999557, 16],
            [5, 1.1999999999995583, -3],
            [-1, 2.599999999999561, -1]
        ];

        KangarooScene.sceneCamera = new SceneCamera(positionKeyFrames, frontKeyFrames);
        KangarooScene.sceneCameraRig = new SceneCameraRig(KangarooScene.sceneCamera);
        KangarooScene.sceneCameraRig.setRenderFront(true);
        KangarooScene.sceneCameraRig.setRenderFrontPoints(true);
        KangarooScene.sceneCameraRig.setRenderPath(true);
        KangarooScene.sceneCameraRig.setRenderPathPoints(true);
        KangarooScene.sceneCameraRig.setRenderPathToFront(true);
        KangarooScene.sceneCameraRig.setScalingFactor(0.1);


    }

    init() {


        //model Placer
        KangarooScene.modelPlacer = new ModelPlacer();

        //Timer
        KangarooScene.timer = new timer([
            [KangarooSceneEventIDS.START_T, [0.0, 1.0]],
            [KangarooSceneEventIDS.MOVE_T, [1.0, 54.0]],
            [KangarooSceneEventIDS.END_T, [55.0, 1.0]]
        ]);

        //Setup Grass and other models Position Acoording To Terrain 
        let model = modelList.find(o => o.name === this.terrainModelName);
        let mesh = model.json.meshes[0];
        let data = new Float32Array(mesh.vertices);

        const grassBladesPos = [];
        let vegetationPosMatrix = [];
        let j = 0;
        for (let i = 0; i < data.length; i += 3) {

            if (data[i + 1] <= 0.0001) {

                //Grass Blades Position
                for (let k = 0; k < 100.0; k++) {
                    j++;

                    let fAngle = Math.random() * 2 * Math.PI;
                    let r = Math.random() * 20.0 + 0.5;
                    grassBladesPos.push(data[i] * this.terrainScale * 2.0 + r * Math.cos(fAngle));
                    grassBladesPos.push(data[i + 1] * this.terrainScale * 2.0);
                    grassBladesPos.push(data[i + 2] * this.terrainScale * 2.0 + r * Math.sin(fAngle));
                }

                j++;
            }
        }
        this.myGrass.GRASS_BLADES = j;
        let baseColor = new Float32Array([0.31, 0.48, 0.0]);
        let tipColor = new Float32Array([0.78, 0.96, 0.0]);

        // let baseColor = new Float32Array([0.06, 0.08, 0.0]);
        // let tipColor = new Float32Array([0.08, 0.10, 0.0]);
        this.myGrass.initGrass(grassBladesPos, baseColor, tipColor);




        //set model matrices of models
        //Terrain modelMatrix
        var modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, 0.0]);
        mat4.scale(modelMatrix, modelMatrix, [this.terrainScale, this.terrainScale, this.terrainScale]);
        this.terrainModelMatrixArray.push(modelMatrix);

        /*
        //TerrainTexture
        let terrainColor = new Uint8Array([0.247 * 255, 0.702 * 255, 0.208 * 255, 255]);
        this.terrainTextue = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.terrainTextue);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, terrainColor);
*/

        //White Texture for other models
        let whitePixel = new Uint8Array([255, 255, 255, 255]);
        this.whiteTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whitePixel);
        gl.bindTexture(gl.TEXTURE_2D, null);



        //Vegetation Initialisation
        //init Vegetation texture and modelMatrix Array
        //  let leafTexture = loadTexture("textures/vegetation/leaf1.png", true);
        //this.myVegetation.initVegetation(leafTexture, vegetationPosMatrix);


        //models
        this.myModelDraw.initDrawModels();


        //Atmospheric Scaterring
        this.myAtmScat.initAtmScattering();


    }

    renderShadow(shadowProgram) {
        // Not sure best way to do this and increases extra work on developer side but at this point fuck it ...
        // make sure to keep this and render function transformation in sync ...



    }

    render() {

        if (DEBUGMODE === CAMERA) {
            KangarooScene.sceneCameraRig.render();
        }

        //gl.depthMask(gl.FALSE);
        this.myAtmScat.renderAtmScattering();
        //gl.depthMask(gl.TRUE);


        this.myModelDraw.renderModels(this.terrainModel, this.whiteTexture, this.terrainModelMatrixArray, this.lightManager);
        this.myModelDraw.renderModels(this.objectsModel, this.whiteTexture, this.terrainModelMatrixArray, this.lightManager);
        this.myModelDraw.renderModels(this.maountainsModel, this.whiteTexture, this.terrainModelMatrixArray, this.lightManager);

        // this.myModelDraw.renderModels(this.kangarooMother, this.whiteTexture, KangarooScene.modelPlacer.getTransformationMatrix(), this.lightManager);
        let transformationMatrix = mat4.create();
        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(0.00, 0.00, 0.00));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00);
        mat4.rotateY(transformationMatrix, transformationMatrix, 4.40);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(3.10, 3.10, 3.10));

        this.myModelDraw.modelProgram.use();
        gl.uniformMatrix4fv(this.myModelDraw.modelProgram.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(this.myModelDraw.modelProgram.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniform3fv(this.myModelDraw.modelProgram.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(this.myModelDraw.modelProgram.programObject);
        gl.uniformMatrix4fv(this.myModelDraw.modelProgram.getUniformLocation("mMat"), false, transformationMatrix);
        renderModel(this.kangarooMother, this.myModelDraw.modelProgram, true, true);


        transformationMatrix = mat4.create();
        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(-6.00, 0.00, 1.00));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00);
        mat4.rotateY(transformationMatrix, transformationMatrix, 8.40);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(6.50, 6.50, 6.50));

        this.myModelDraw.modelProgram.use();
        gl.uniformMatrix4fv(this.myModelDraw.modelProgram.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(this.myModelDraw.modelProgram.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniform3fv(this.myModelDraw.modelProgram.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(this.myModelDraw.modelProgram.programObject);
        gl.uniformMatrix4fv(this.myModelDraw.modelProgram.getUniformLocation("mMat"), false, transformationMatrix);
        renderModel(this.kangarooBaby, this.myModelDraw.modelProgram, true, true);


        //RenderGrass
        this.myGrass.renderGrass();


    }

    update() {

        this.myGrass.updateGrass();


        KangarooScene.sceneCamera.setT(KangarooScene.timer.getEventTime(KangarooSceneEventIDS.MOVE_T));
        // updateModel(KangarooScene.modelCat, 0, GLOBAL.deltaTime);
        KangarooScene.timer.increment();

        if (KangarooScene.timer.isEventStarted(KangarooSceneEventIDS.START_T) && KangarooScene.songStart == 0) {
            songPlayer.currentTime = 105.0;
            KangarooScene.songStart = 1;
            postProcessingSettings.enableFog = false;
        }

        // Fade IN This condition ensures that only change fade when start event is started and it not completed.
        if (KangarooScene.timer.isEventStarted(KangarooSceneEventIDS.START_T) && !KangarooScene.timer.isEventComplete(KangarooSceneEventIDS.START_T)) {
            globalFade = 1.0 - KangarooScene.timer.getEventTime(KangarooSceneEventIDS.START_T);
        }

        if (KangarooScene.timer.isEventStarted(KangarooSceneEventIDS.END_T) && !KangarooScene.timer.isEventComplete(KangarooSceneEventIDS.END_T)) {
            globalFade = KangarooScene.timer.getEventTime(KangarooSceneEventIDS.END_T);
        }

        if (KangarooScene.timer.isEventComplete(KangarooSceneEventIDS.END_T)) {
            this.isComplete = true;

            this.uninit();
        }


    }

    reset() {
        // reset stuff like timers and events
    }

    uninit() {
        // clean eveything created in init

    }

    renderUI() {

        switch (DEBUGMODE) {
            case MODEL:
                KangarooScene.modelPlacer.renderUI();
                break;
            case CAMERA:
                KangarooScene.sceneCameraRig.renderUI();
                break;
            case LIGHT:
                this.lightManager.renderUI();
                break;
            case NONE:
                break;
        }

    }

    keyboardfunc(key) {
        switch (DEBUGMODE) {
            case MODEL:
                KangarooScene.modelPlacer.handleKeyboardInput(key);
                break;
            case CAMERA:
                KangarooScene.sceneCameraRig.keyboardFunc(key);
                break;
            case LIGHT:
                break;
            case NONE:
                break;
        }
        if (key == 'Space') {
            //this.isComplete = true;
        }

        switch (key) {
            case 'KeyP':
                break;
            case 'ArrowUp':
                KangarooScene.timer.addTime(0.4);
                break;
            case 'ArrowDown':
                KangarooScene.timer.subtractTime(0.4);
                break;
            case 'Tab':
                break;
        }
    }

    getCamera() {
        // return camera created in setupCameras;
        return KangarooScene.sceneCamera;

    }

    isCompleted() {
        return this.isComplete;
    }


    getSceneTime() {

        return KangarooScene.timer.getT();

    }
}
