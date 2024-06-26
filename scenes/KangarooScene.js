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
    MOVE_KANGAROO_MOTHER_1: 2,
    MOVE_KANGAROO_JOEY_1: 3,
    MOVE_KANGAROO_JOEY_2: 5,
    END_T: 6
};

class kangarooScene extends Scene {

    constructor() {
        super();
        this.isComplete = false;
    }

    setupProgram() {
        KangarooScene.programCelShader = new ShaderProgram(gl, ['shaders/model/model.vert', 'shaders/model/celShader.frag']);
    }

    setupCamera() {
        // Setup All Cameras here
        const positionKeyFrames = [
            [-208, 63, 272],
            [-125, 43, 230],
            [-96, 38, 204],
            [-79, 29, 153],
            [-68, 18.799999999999898, 88],
            [-60, 13.399999999999693, 19],
            [-41, 15.299999999999578, -122],
            [-3, 17.699999999999527, -1],
            [-46, 18.899999999999615, 12],
            [-49, 19.999999999999588, -111],
            [-33, 7.799999999999544, -27.49999999999997],
        ];

        const frontKeyFrames = [
            [-52, 55, 254],
            [-41, 20, 191],
            [-48, 16, 148],
            [-48, 15, 105],
            [-47, 12.799999999999898, 52],
            [-44, 15.399999999999693, -11],
            [-33, 16.299999999999578, -97,],
            [-39, 6.699999999999527, -10],
            [-35, 11.899999999999615, -37],
            [-47, 4.999999999999588, -62],
            [-32, 3.1999999999995623, -16],
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

                this.kangarooMother = setupModel("kangarooMother", true);
                this.kangarooJoey = setupModel("kangarooJoey", true);
                // Spline Path for Elephant can be done in constructor

                this.currentMotherAnimation = 2; //Running
                this.currentBabyAnimation = 3; //Running
                const motherPositions = [
                    [-52, 0, 205],
                    [-40, 0, 115],
                    [-18, 0, 40],
                    [-29, 0, -25],
                ];

                this.motherPathSpline = new BsplineInterpolator(motherPositions);
                this.splineMotherAdjuster = new SplineAdjuster(this.motherPathSpline);
                this.splineMotherAdjuster.setRenderPath(true);
                this.splineMotherAdjuster.setRenderPathPoints(true);
                //this.splineAdjuster.setScalingFactor(0.01);

                //For First Movement Of Joey
                const joeyPositions_1 = [
                    [-85, 0, 205],
                    [-75, 0, 114],
                    [-66, 0, 39],
                    [-63, 0, -24],
                ];

                this.joeyPathSpline_1 = new BsplineInterpolator(joeyPositions_1);
                this.splineJoeyAdjuster_1 = new SplineAdjuster(this.joeyPathSpline_1);
                this.splineJoeyAdjuster_1.setRenderPath(true);
                this.splineJoeyAdjuster_1.setRenderPathPoints(true);

                //For Second Movment of Joey
                const joeyPositions_2 = [
                    [-63, 0, -24],
                    [-61, 0, -53],
                    [-50, 0, -77],
                    [-31, 0, -94]
                ];

                this.joeyPathSpline_2 = new BsplineInterpolator(joeyPositions_2);
                this.splineJoeyAdjuster_2 = new SplineAdjuster(this.joeyPathSpline_2);
                this.splineJoeyAdjuster_2.setRenderPath(true);
                this.splineJoeyAdjuster_2.setRenderPathPoints(true);

                //Extra Kangaroos_1
                const kangarooPositions_1 = [
                    [-92, 0, 189],
                    [-77, 0, 115],
                    [-90, 0, 40],
                    [-107, 0, -35]
                ];

                this.kangarooPathSpline_1 = new BsplineInterpolator(kangarooPositions_1);
                this.splineKangarooAdjuster_1 = new SplineAdjuster(this.kangarooPathSpline_1);
                this.splineKangarooAdjuster_1.setRenderPath(true);
                this.splineKangarooAdjuster_1.setRenderPathPoints(true);
                //Extra Kangaroos_2
                const kangarooPositions_2 = [
                    [-33, 0, 199],
                    [-14, 0, 115],
                    [-6, 0, 40],
                    [28, 0, -34],
                ];

                this.kangarooPathSpline_2 = new BsplineInterpolator(kangarooPositions_2);
                this.splineKangarooAdjuster_2 = new SplineAdjuster(this.kangarooPathSpline_2);
                this.splineKangarooAdjuster_2.setRenderPath(true);
                this.splineKangarooAdjuster_2.setRenderPathPoints(true);
                //change Spline Adjuster mother/joey
                this.splineAdjuster = this.splineKangarooAdjuster_2;

        //model Placer
        KangarooScene.modelPlacer = new ModelPlacer();

        //Timer
        KangarooScene.timer = new timer([
            [KangarooSceneEventIDS.START_T, [0.0, 1.0]],
            [KangarooSceneEventIDS.MOVE_T, [1.0, 35.0]],

            //First Movement -> both moving
            [KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, [0.0, 20.0]],
            [KangarooSceneEventIDS.MOVE_KANGAROO_JOEY_1, [0.0, 20.0]],

            //Third movement movement -> joey moving, mother standing
            [KangarooSceneEventIDS.MOVE_KANGAROO_JOEY_2, [25.0, 10.0]],
            [KangarooSceneEventIDS.END_T, [35.0, 1.0]]
        ]);

        // setup callbacks for 1 time events
        //2nd move ->both standing
        KangarooScene.timer.registerCallback(21.0, () => { this.currentMotherAnimation = 1 }); //Standing
        KangarooScene.timer.registerCallback(21.0, () => { this.currentBabyAnimation = 1 }); //standing

        //3rd move ->mother standing, joey moving
        KangarooScene.timer.registerCallback(25.0, () => { this.currentMotherAnimation = 0 });//standing action
        KangarooScene.timer.registerCallback(25.0, () => { this.currentBabyAnimation = 3 }); //Running


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

        //White Texture for other models
        let whitePixel = new Uint8Array([255, 255, 255, 255]);
        this.whiteTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whitePixel);
        gl.bindTexture(gl.TEXTURE_2D, null);

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

        if (DEBUGMODE === SPLINE) {
            this.splineAdjuster.render();
        }

        //gl.depthMask(gl.FALSE);
        this.myAtmScat.renderAtmScattering();
        //gl.depthMask(gl.TRUE);

        this.myModelDraw.renderModels(this.terrainModel, this.whiteTexture, this.terrainModelMatrixArray, this.lightManager);
        this.myModelDraw.renderModels(this.objectsModel, this.whiteTexture, this.terrainModelMatrixArray, this.lightManager);
        this.myModelDraw.renderModels(this.maountainsModel, this.whiteTexture, this.terrainModelMatrixArray, this.lightManager);

        // this.myModelDraw.renderModels(this.kangarooMother, this.whiteTexture, KangarooScene.modelPlacer.getTransformationMatrix(), this.lightManager);
        KangarooScene.programCelShader.use();
        gl.uniformMatrix4fv(KangarooScene.programCelShader.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(KangarooScene.programCelShader.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniform3fv(KangarooScene.programCelShader.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(KangarooScene.programCelShader.programObject);

        if (KangarooScene.timer.currentTime < 25.0) {
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.motherPathSpline);
            this.renderKangarooJoey(KangarooSceneEventIDS.MOVE_KANGAROO_JOEY_1, this.joeyPathSpline_1);
            //Extra Kangaroo
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.kangarooPathSpline_1);
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.kangarooPathSpline_2);
        }
        else if (KangarooScene.timer.currentTime >= 25.0) {
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.motherPathSpline);
            this.renderKangarooJoey(KangarooSceneEventIDS.MOVE_KANGAROO_JOEY_2, this.joeyPathSpline_2);
            //Extra Kangaroo
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.kangarooPathSpline_1);
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.kangarooPathSpline_2);
        }

        //RenderGrass
        this.myGrass.renderGrass();
    }

    renderKangarooMother(eventID, pathSpline) {
        //Kangaroo Mother
        var t = KangarooScene.timer.getEventTime(eventID);
        var position = pathSpline.interpolateSpline(t - 0.01);
        var front = pathSpline.interpolateSpline(t);
        // Translation matrix
        let translationMatrix = mat4.create();
        mat4.translate(translationMatrix, translationMatrix, position);
        // Orientation matrix using targetat
        let orientationMatrix = targetat(position, front, vec3.fromValues(0.0, 1.0, 0.0));
        // Combining the matrices
        let finalMatrix = mat4.create();
        mat4.multiply(finalMatrix, translationMatrix, orientationMatrix);
        mat4.scale(finalMatrix, finalMatrix, vec3.fromValues(5.50, 5.50, 5.50));
        gl.uniformMatrix4fv(KangarooScene.programCelShader.getUniformLocation("mMat"), false, finalMatrix);
        //renderModel(this.elephantMother, this.myModelDraw.modelProgram, true,true);
        uploadBoneMatrices(this.kangarooMother, KangarooScene.programCelShader, this.currentMotherAnimation);
        renderModel(this.kangarooMother, KangarooScene.programCelShader, true, true);
    }

    renderKangarooJoey(eventID, pathSpline) {
        //Kangaroo Mother
        var t = KangarooScene.timer.getEventTime(eventID);
        var position = pathSpline.interpolateSpline(t - 0.01);
        var front = pathSpline.interpolateSpline(t);
        // Translation matrix
        let translationMatrix = mat4.create();
        mat4.translate(translationMatrix, translationMatrix, position);
        // Orientation matrix using targetat
        let orientationMatrix = targetat(position, front, vec3.fromValues(0.0, 1.0, 0.0));
        // Combining the matrices
        let finalMatrix = mat4.create();
        mat4.multiply(finalMatrix, translationMatrix, orientationMatrix);
        mat4.scale(finalMatrix, finalMatrix, vec3.fromValues(9.50, 9.50, 9.50));
        gl.uniformMatrix4fv(KangarooScene.programCelShader.getUniformLocation("mMat"), false, finalMatrix);
        //renderModel(this.elephantMother, this.myModelDraw.modelProgram, true,true);
        uploadBoneMatrices(this.kangarooJoey, KangarooScene.programCelShader, this.currentBabyAnimation);
        renderModel(this.kangarooJoey, KangarooScene.programCelShader, true, true);
    }


    update() {

        this.myGrass.updateGrass();
        updateModel(this.kangarooMother, this.currentMotherAnimation, GLOBAL.deltaTime);
        updateModel(this.kangarooJoey, this.currentBabyAnimation, GLOBAL.deltaTime);
        KangarooScene.sceneCamera.setT(KangarooScene.timer.getEventTime(KangarooSceneEventIDS.MOVE_T));
        // updateModel(KangarooScene.modelCat, 0, GLOBAL.deltaTime);
        KangarooScene.timer.increment();
        if (KangarooScene.timer.isEventStarted(KangarooSceneEventIDS.START_T) && KangarooScene.songStart == 0) {
            songPlayer.currentTime = 125.0;
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
            //this.uninit();
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
            case SPLINE:
                this.splineAdjuster.renderUI();
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
            case SPLINE:
                this.splineAdjuster.keyboardFunc(key);
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
