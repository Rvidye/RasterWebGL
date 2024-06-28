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
    MOVE_KANGAROO_MOTHER_2: 6,
    END_T: 7
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
            [14.199999999999317, 15.69999999999994, 212.5999999999999],
            [4.799999999999747, 16.599999999999966, 167.30000000000032],
            [0.7999999999998928, 17.099999999999973, 107.2000000000005],
            [-30.60000000000003, 15.799999999999985, 69.40000000000043],
            [-45.99999999999999, 12.199999999999896, 63.80000000000012],
            [-80.89999999999992, 23.299999999999702, 57.50000000000005],
            [-119.09999999999974, 28.499999999999595, 84.79999999999971],
            [-84.39999999999995, 9.999999999999527, 118.89999999999978],
            [-40.49999999999999, 10.099999999999614, 101.09999999999987],
            [-40.19999999999999, 6.799999999999587, 14.399999999999817],
            [-50.60000000000002, 7.799999999999544, -13.199999999999958],
        ];

        const frontKeyFrames = [
            [-47.599999999999994, 2.199999999999954, 182.50000000000037],
            [-49.80000000000001, 3.4999999999999996, 154.7000000000002],
            [-51.300000000000004, 3.9000000000000035, 120.50000000000014],
            [-53.50000000000001, 2.9000000000000035, 95.10000000000005],
            [-67.9, 6.1999999999999, 70.69999999999997],
            [-55.000000000000014, 7.6999999999996955, 76.99999999999999],
            [-63.80000000000003, 3.0999999999995818, 85.59999999999984],
            [-53.30000000000002, 5.599999999999527, 62.60000000000005],
            [-46.000000000000014, 7.499999999999616, 35.600000000000044],
            [-49.2, 4.999999999999588, 23.80000000000006],
            [-57.30000000000003, 5.399999999999562, 41.200000000000024],
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

        const motherPositions_1 = [
            [-120, 0, 79],
            [-96, 0, 74],
            [-72, 0, 78],
            [-60, 0, 89],

        ];

        this.motherPathSpline_1 = new BsplineInterpolator(motherPositions_1);
        this.splineMotherAdjuster_1 = new SplineAdjuster(this.motherPathSpline_1);
        this.splineMotherAdjuster_1.setRenderPath(true);
        this.splineMotherAdjuster_1.setRenderPathPoints(true);

        const motherPositions_2 = [
            [-58, 0, 89],
            [-55, 0, 71],
            [-55, 0, 57],
            [-56, 0, 44],
        ];

        this.motherPathSpline_2 = new BsplineInterpolator(motherPositions_2);
        this.splineMotherAdjuster_2 = new SplineAdjuster(this.motherPathSpline_2);
        this.splineMotherAdjuster_2.setRenderPath(true);
        this.splineMotherAdjuster_2.setRenderPathPoints(true);

        //For First Movement Of Joey
        const joeyPositions_1 = [
            [-72, 0, 189],
            [-73, 0, 161],
            [-73, 0, 131],
            [-77, 0, 100],

        ];

        this.joeyPathSpline_1 = new BsplineInterpolator(joeyPositions_1);
        this.splineJoeyAdjuster_1 = new SplineAdjuster(this.joeyPathSpline_1);
        this.splineJoeyAdjuster_1.setRenderPath(true);
        this.splineJoeyAdjuster_1.setRenderPathPoints(true);

        //For Second Movment of Joey
        const joeyPositions_2 = [
            [-77, 0, 100],
            [-74, 0, 64],
            [-75, 0, 41],
            [-77, 0, 18],
        ];

        this.joeyPathSpline_2 = new BsplineInterpolator(joeyPositions_2);
        this.splineJoeyAdjuster_2 = new SplineAdjuster(this.joeyPathSpline_2);
        this.splineJoeyAdjuster_2.setRenderPath(true);
        this.splineJoeyAdjuster_2.setRenderPathPoints(true);

        /*
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
*/

        //change Spline Adjuster mother/joey
        this.splineAdjuster = this.splineJoeyAdjuster_2;

        //model Placer
        KangarooScene.modelPlacer = new ModelPlacer();

        //Timer
        KangarooScene.timer = new timer([
            [KangarooSceneEventIDS.START_T, [0.0, 1.0]],
            [KangarooSceneEventIDS.MOVE_T, [1.0, 35.0]],

            //First Movement -> both moving
            [KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, [10.0, 10.0]],
            [KangarooSceneEventIDS.MOVE_KANGAROO_JOEY_1, [0.0, 10.0]],

            //Third movement movement -> joey moving, mother standing
            [KangarooSceneEventIDS.MOVE_KANGAROO_JOEY_2, [25.0, 10.0]],
            [KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_2, [25.0, 6.0]],

            [KangarooSceneEventIDS.END_T, [35.0, 1.0]]
        ]);

        // setup callbacks for 1 time events
        //2nd move ->both standing

        KangarooScene.timer.registerCallback(10.0, () => { this.currentBabyAnimation = 1 }); //standing
        KangarooScene.timer.registerCallback(25.0, () => { this.currentBabyAnimation = 3 }); //Running


        KangarooScene.timer.registerCallback(10.0, () => { this.currentMotherAnimation = 2 }); //Running
        KangarooScene.timer.registerCallback(20.0, () => { this.currentMotherAnimation = 0 }); //Standing
        KangarooScene.timer.registerCallback(25.0, () => { this.currentMotherAnimation = 2 }); //Running
        KangarooScene.timer.registerCallback(31.0, () => { this.currentMotherAnimation = 1 }); //Standing




        //3rd move ->mother standing, joey moving
        //   KangarooScene.timer.registerCallback(25.0, () => { this.currentMotherAnimation = 0 });//standing action
        //   KangarooScene.timer.registerCallback(25.0, () => { this.currentBabyAnimation = 3 }); //Running


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

        this.myModelDraw.renderModels(this.terrainModel, this.whiteTexture, this.terrainModelMatrixArray, this.lightManager, false);
        this.myModelDraw.renderModels(this.objectsModel, this.whiteTexture, this.terrainModelMatrixArray, this.lightManager, true);
        this.myModelDraw.renderModels(this.maountainsModel, this.whiteTexture, this.terrainModelMatrixArray, this.lightManager,true);

        // this.myModelDraw.renderModels(this.kangarooMother, this.whiteTexture, KangarooScene.modelPlacer.getTransformationMatrix(), this.lightManager);
        KangarooScene.programCelShader.use();
        gl.uniformMatrix4fv(KangarooScene.programCelShader.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(KangarooScene.programCelShader.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniform3fv(KangarooScene.programCelShader.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(KangarooScene.programCelShader.programObject);

        if (KangarooScene.timer.currentTime < 25.0) {
            this.renderKangarooJoey(KangarooSceneEventIDS.MOVE_KANGAROO_JOEY_1, this.joeyPathSpline_1);
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.motherPathSpline_1);
        }
        else if (KangarooScene.timer.currentTime < 45.0) {

            this.renderKangarooJoey(KangarooSceneEventIDS.MOVE_KANGAROO_JOEY_2, this.joeyPathSpline_2);
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_2, this.motherPathSpline_2);
        }
        /*
        if (KangarooScene.timer.currentTime < 25.0) {
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.motherPathSpline_1);
            this.renderKangarooJoey(KangarooSceneEventIDS.MOVE_KANGAROO_JOEY_1, this.joeyPathSpline_1);
            //Extra Kangaroo
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.kangarooPathSpline_1);
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.kangarooPathSpline_2);
        }
        else if (KangarooScene.timer.currentTime >= 25.0) {
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.motherPathSpline_1);
            this.renderKangarooJoey(KangarooSceneEventIDS.MOVE_KANGAROO_JOEY_2, this.joeyPathSpline_2);
            //Extra Kangaroo
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.kangarooPathSpline_1);
            this.renderKangarooMother(KangarooSceneEventIDS.MOVE_KANGAROO_MOTHER_1, this.kangarooPathSpline_2);
        }
*/

        //RenderGrass
        gl.depthMask(false);
        this.myGrass.renderGrass();
        gl.depthMask(true);
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
        mat4.scale(finalMatrix, finalMatrix, vec3.fromValues(4.50, 4.50, 4.50));
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
            //songPlayer.currentTime = 125.0;
            KangarooScene.songStart = 1;
            postProcessingSettings.enableFog = false;
            postProcessingSettings.enableOutline = true;
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
