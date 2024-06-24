"use strict"


var ElephantScene = {
    modelPlacer: null,
    sceneCamera: null,
    sceneCameraRig: null,
    programCelShader : null,
    timer: null,
    songStart: 0
};

const ElephantSceneEventIDS = {
    START_T: 0,
    MOVE_T: 1,
    END_T: 2
};

class elephantScene extends Scene {

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

        //PondWater
        this.myPondWater = new pondWater();


        //Load Models
        //Terrain
        this.terrainScale = 1000.0;
        this.terrainModelName = "terrain";
        this.terrainModel = setupModel(this.terrainModelName, false);
        this.terrainModelMatrixArray = [];
        this.terrainTextue = null;


        this.whiteTexture = null;
        //Tree1
        this.tree1Model = setupModel("tree1", false);
        this.tree1ModelMatrixArray = [];
        //Tree2
        this.tree2Model = setupModel("tree2", false);
        this.tree2ModelMatrixArray = [];
        //Tree3
        this.tree3Model = setupModel("tree3", false);
        this.tree3ModelMatrixArray = [];

        //Tree Logs
        this.treeLog1Model = setupModel("treeLog1", false);
        this.treeLog1ModelMatrixArray = [];

        this.treeLog2Model = setupModel("treeLog2", false);
        this.treeLog2ModelMatrixArray = [];

        //Tree Trunks
        this.treeTrunk1Model = setupModel("treeTrunk1", false);
        this.treeTrunk1ModelMatrixArray = [];

        this.treeTrunk2Model = setupModel("treeTrunk2", false);
        this.treeTrunk2ModelMatrixArray = [];


        //Stones
        this.stone1Model = setupModel("stone1", false);
        this.stone1ModelMatrixArray = [];

        this.elephantMother = setupModel("elepahntMother",false);
        this.elephantCub = setupModel("elephantCub",false);

        this.elephantMotherAnim = setupModel("elephantMother",true);
        this.elephantCubAnim = setupModel("elephantCub",true);

        this.kangarooMother = setupModel("kangarooMother",true);
        this.kangarooJoey = setupModel("kangarooJoey",true);

    }

    setupProgram() {
        ElephantScene.programCelShader = new ShaderProgram(gl, ['shaders/model/model.vert', 'shaders/model/celShader.frag']);
    }

    setupCamera() {

        // Setup All Cameras here
        // Setup All Cameras here
        const positionKeyFrames = [
            [136, 50, 332],
            [46, 50, 273],
            [-34, 42.7999999999999, 209],
            [-138, 28.399999999999693, 120],
            [-229, 20.299999999999578, 13],
            [-215, 16.699999999999527, -112],
            [-111, 22.899999999999615, -45],
            [-77, 20.999999999999588, 100],
            [-158, 8.799999999999544, 163.50000000000003],
            [-325, 5.099999999999557, 54],
            [-215, 33.59999999999977, -208],
            [0, 50, -300],
            [181, 50, -305],
            [306, 50, -4],
            [61, 50, 249],
            [-24, 28.19999999999969, 132],
            [0, -1.2000000000004418, 0.9000000000000329]

        ];

        const frontKeyFrames = [
            [129, 42, 319],
            [17, 50, 245],
            [-79, 35.6999999999998, 154],
            [-191, 18.799999999999557, 9],
            [-157, 23.699999999999626, 16],
            [-165, 21.09999999999959, 26],
            [-177, 17.099999999999532, 0],
            [-139, 14.799999999999523, 10],
            [-325, 4.1999999999995605, 38],
            [-119, 39.99999999999986, -251],
            [230, 50, -247],
            [262, 50, 81],
            [140, 50, 187],
            [-7, 50, 148],
            [12, -1.2000000000004418, -34],
            [15, -0.8000000000004416, -48],
            [22, -5.400000000000439, -66]
        ];

        ElephantScene.sceneCamera = new SceneCamera(positionKeyFrames, frontKeyFrames);
        ElephantScene.sceneCameraRig = new SceneCameraRig(ElephantScene.sceneCamera);
        ElephantScene.sceneCameraRig.setRenderFront(true);
        ElephantScene.sceneCameraRig.setRenderFrontPoints(true);
        ElephantScene.sceneCameraRig.setRenderPath(true);
        ElephantScene.sceneCameraRig.setRenderPathPoints(true);
        ElephantScene.sceneCameraRig.setRenderPathToFront(true);
        ElephantScene.sceneCameraRig.setScalingFactor(0.1);
    }

    init() {

        //model Placer
        ElephantScene.modelPlacer = new ModelPlacer();

        //Timer
        ElephantScene.timer = new timer([
            [ElephantSceneEventIDS.START_T, [0.0, 1.0]],
            //[ElephantSceneEventIDS.MOVE_T, [50.0, 15.0]], baby elephant entry
            //[ElephantSceneEventIDS.MOVE_T, [65.0, .0]], mother elephant entry
            [ElephantSceneEventIDS.MOVE_T, [1.0, 54.0]],
            [ElephantSceneEventIDS.END_T, [55.0, 1.0]]
        ]);


        //Setup Grass and other models Position Acoording To Terrain 
        let model = modelList.find(o => o.name === this.terrainModelName);
        let mesh = model.json.meshes[0];
        let data = new Float32Array(mesh.vertices);
        let j = 0;


        const grassBladesPos = [];
        let vegetationPosMatrix = [];

        for (let i = 0; i < data.length; i += 3) {

            if ((Math.abs(data[i]) > Math.random() * 0.05 + 0.19 || Math.abs(data[i + 2]) > Math.random() * 0.05 + 0.15) && data[i + 1] == 0.0) {

                //Grass Blades Position
                for (let k = 0; k < 200.0; k++) {
                    j++;

                    let fAngle = Math.random() * 2 * Math.PI;
                    let r = Math.random() * 20.0 + 0.5;
                    grassBladesPos.push(data[i] * this.terrainScale * 2.0 + r * Math.cos(fAngle));
                    grassBladesPos.push(data[i + 1] * this.terrainScale * 2.0);
                    grassBladesPos.push(data[i + 2] * this.terrainScale * 2.0 + r * Math.sin(fAngle));
                }

                //Vegetation position
                if (Math.random() < 0.1) {
                    let tempMat = mat4.create();
                    mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                    vegetationPosMatrix.push(tempMat);
                }


            }
            //Tree models
            //For Models Setting modelMatrices
            if ((Math.abs(data[i]) > Math.random() * 0.01 + 0.19 || Math.abs(data[i + 2]) > Math.random() * 0.01 + 0.15)) {

                let randomFact = 0.0;
                let randomLogFact = 0.005;
                let randomTrunkFact = 0.005;


                if (data[i + 1] > 1.0) {
                    randomFact = 0.1;
                }
                else {
                    randomFact = 0.03;
                }

                //Big Tree
                if (Math.random() < randomFact) {

                    let tempMat = mat4.create();
                    mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                    mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                    let scaleFactor = Math.random() * 2.5 + 2.0;
                    mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                    this.tree1ModelMatrixArray.push(tempMat);

                }
                else if (Math.random() < randomFact) {
                    //Medium Tree
                    let tempMat = mat4.create();
                    mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                    mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                    let scaleFactor = Math.random() * 2.5 + 2.0;
                    mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                    this.tree2ModelMatrixArray.push(tempMat);


                } else if (Math.random() < randomFact) {
                    //Small Tree
                    let tempMat = mat4.create();
                    mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                    mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                    let scaleFactor = Math.random() * 2.5 + 2.0;
                    mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                    this.tree3ModelMatrixArray.push(tempMat);

                } else if (Math.random() < randomLogFact) {
                    //Big Log

                    let tempMat = mat4.create();
                    mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                    mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                    let scaleFactor = Math.random() * 2.5 + 2.0;
                    mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                    this.treeLog1ModelMatrixArray.push(tempMat);

                } else if (Math.random() < randomLogFact) {
                    //Medium Log
                    let tempMat = mat4.create();
                    mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                    mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                    let scaleFactor = Math.random() * 2.5 + 2.0;
                    mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                    this.treeLog2ModelMatrixArray.push(tempMat);
                }
                else if (Math.random() < randomTrunkFact) {
                    //Big Trunk

                    let tempMat = mat4.create();
                    mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                    mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                    let scaleFactor = Math.random() * 2.5 + 2.0;
                    mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                    this.treeTrunk1ModelMatrixArray.push(tempMat);

                } else if (Math.random() < randomTrunkFact) {
                    //Medium Trunk
                    let tempMat = mat4.create();
                    mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                    mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                    let scaleFactor = Math.random() * 2.5 + 2.0;
                    mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                    this.treeTrunk2ModelMatrixArray.push(tempMat);
                }


            }





            //Under Water Rocks
            if (Math.random() < 0.002 && data[i + 1] < 0.0) {
                let tempMat = mat4.create();
                mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                mat4.rotateX(tempMat, tempMat, Math.PI / 2.0);
                let scaleFactor = Math.random() * 0.1 + 0.05;
                mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                this.stone1ModelMatrixArray.push(tempMat);
            }

            if (Math.random() < 0.02 && data[i + 1] >= 0.0) {
                let tempMat = mat4.create();
                mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                mat4.rotateX(tempMat, tempMat, Math.PI / 2.0);
                let scaleFactor = Math.random() * 0.2 + 0.1;
                mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                this.stone1ModelMatrixArray.push(tempMat);
            }


        }

        this.myGrass.GRASS_BLADES = j;
        this.myGrass.initGrass(grassBladesPos);

        //Terrain modelMatrix
        var modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, 0.0]);
        mat4.scale(modelMatrix, modelMatrix, [this.terrainScale, this.terrainScale, this.terrainScale]);
        this.terrainModelMatrixArray.push(modelMatrix);

        //TerrainTexture
        let terrainColor = new Uint8Array([0.247 * 255, 0.702 * 255, 0.208 * 255, 255]);
        this.terrainTextue = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.terrainTextue);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, terrainColor);

        //White Texture for other models
        let whitePixel = new Uint8Array([255, 255, 255, 255]);
        this.whiteTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whitePixel);
        gl.bindTexture(gl.TEXTURE_2D, null);


        //Vegetation Initialisation
        //init Vegetation texture and modelMatrix Array
        let leafTexture = loadTexture("textures/vegetation/leaf1.png", true);
        this.myVegetation.initVegetation(leafTexture, vegetationPosMatrix);


        //models
        this.myModelDraw.initDrawModels();

        //Pond Water.
        this.myPondWater.initPondWater();

        //Atmospheric Scaterring
        this.myAtmScat.initAtmScattering();


    }

    renderShadow(shadowProgram) {
        // Not sure best way to do this and increases extra work on developer side but at this point fuck it ...
        // make sure to keep this and render function transformation in sync ...

        //for Terrain
        this.myModelDraw.renderShadow(shadowProgram, this.terrainModel, this.terrainModelMatrixArray);

        //For tree1 model
        this.myModelDraw.renderShadow(shadowProgram, this.tree1Model, this.tree1ModelMatrixArray);


    }

    render() {

        if (DEBUGMODE === CAMERA) {
            ElephantScene.sceneCameraRig.render();
        }

        //gl.depthMask(gl.FALSE);
        this.myAtmScat.renderAtmScattering();
        //  gl.depthMask(gl.TRUE);
        this.myGrass.renderGrass();

        // this.myVegetation.renderVegetation();

        //for Terrain
        this.myModelDraw.renderModels(this.terrainModel, this.terrainTextue, this.terrainModelMatrixArray, this.lightManager);


        //For tree1 model
        this.myModelDraw.renderModels(this.tree1Model, this.whiteTexture, this.tree1ModelMatrixArray, this.lightManager);

        //For tree2 model
        this.myModelDraw.renderModels(this.tree2Model, this.whiteTexture, this.tree2ModelMatrixArray, this.lightManager);

        //For tree3 model
        this.myModelDraw.renderModels(this.tree3Model, this.whiteTexture, this.tree3ModelMatrixArray, this.lightManager);

        //Tree Logs
        this.myModelDraw.renderModels(this.treeLog1Model, this.whiteTexture, this.treeLog1ModelMatrixArray, this.lightManager);
        this.myModelDraw.renderModels(this.treeLog2Model, this.whiteTexture, this.treeLog2ModelMatrixArray, this.lightManager);

        //Tree Trunks
        this.myModelDraw.renderModels(this.treeTrunk1Model, this.whiteTexture, this.treeTrunk1ModelMatrixArray, this.lightManager);
        this.myModelDraw.renderModels(this.treeTrunk2Model, this.whiteTexture, this.treeTrunk2ModelMatrixArray, this.lightManager);


        //for stone1 model
        this.myModelDraw.renderModels(this.stone1Model, this.terrainTextue, this.stone1ModelMatrixArray, this.lightManager);

        var transformationMatrix = mat4.create();
        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(-178.0, 0.00, -14.0));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00);
        mat4.rotateY(transformationMatrix, transformationMatrix, 1.60);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(9.50, 9.50, 9.50));
        ElephantScene.programCelShader.use();
        gl.uniformMatrix4fv(ElephantScene.programCelShader.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(ElephantScene.programCelShader.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());
        gl.uniform3fv(ElephantScene.programCelShader.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(ElephantScene.programCelShader.programObject);
        gl.uniformMatrix4fv(ElephantScene.programCelShader.getUniformLocation("mMat"),false, transformationMatrix);
        //renderModel(this.elephantMother, this.myModelDraw.modelProgram, true,true);
        uploadBoneMatrices(this.elephantMotherAnim, ElephantScene.programCelShader, 0);
        renderModel(this.elephantMotherAnim, ElephantScene.programCelShader, true, true);

        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(-170.0, 0.00, -35.0));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00);
        mat4.rotateY(transformationMatrix, transformationMatrix, 1.60);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(9.50, 9.50, 9.50));
        ElephantScene.programCelShader.use();
        gl.uniformMatrix4fv(ElephantScene.programCelShader.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(ElephantScene.programCelShader.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());
        gl.uniform3fv(ElephantScene.programCelShader.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(ElephantScene.programCelShader.programObject);
        gl.uniformMatrix4fv(ElephantScene.programCelShader.getUniformLocation("mMat"),false, transformationMatrix);
        uploadBoneMatrices(this.elephantCubAnim, ElephantScene.programCelShader, 0);
        renderModel(this.elephantCubAnim, ElephantScene.programCelShader, true, true);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this.myPondWater.renderPondWater(this.lightManager);
        gl.disable(gl.BLEND);

    }

    update() {

        this.myAtmScat.updateAtmScattering();
        this.myGrass.updateGrass();
        this.myVegetation.updateVegetation();
        this.myPondWater.updatePondWater();

        updateModel(this.elephantMotherAnim,0,GLOBAL.deltaTime);
        updateModel(this.elephantCubAnim,0,GLOBAL.deltaTime);

        ElephantScene.sceneCamera.setT(ElephantScene.timer.getEventTime(ElephantSceneEventIDS.MOVE_T));
        // updateModel(ElephantScene.modelCat, 0, GLOBAL.deltaTime);
        ElephantScene.timer.increment();

        if (ElephantScene.timer.isEventStarted(ElephantSceneEventIDS.START_T) && ElephantScene.songStart == 0) {
            songPlayer.currentTime = 50.0;
            ElephantScene.songStart = 1;
            postProcessingSettings.enableFog = true;
        }

        // Fade IN This condition ensures that only change fade when start event is started and it not completed.
        if (ElephantScene.timer.isEventStarted(ElephantSceneEventIDS.START_T) && !ElephantScene.timer.isEventComplete(ElephantSceneEventIDS.START_T)) {
            globalFade = 1.0 - ElephantScene.timer.getEventTime(ElephantSceneEventIDS.START_T);
        }

        if (ElephantScene.timer.isEventStarted(ElephantSceneEventIDS.END_T) && !ElephantScene.timer.isEventComplete(ElephantSceneEventIDS.END_T)) {
            globalFade = ElephantScene.timer.getEventTime(ElephantSceneEventIDS.END_T);
        }

        if (ElephantScene.timer.isEventComplete(ElephantSceneEventIDS.END_T)) {
            this.isComplete = true;
        }


    }

    reset() {
        // reset stuff like timers and events
    }

    unint() {
        // clean eveything created in init
    }

    renderUI() {

        switch (DEBUGMODE) {
            case MODEL:
                ElephantScene.modelPlacer.renderUI();
                break;
            case CAMERA:
                ElephantScene.sceneCameraRig.renderUI();
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
                ElephantScene.modelPlacer.handleKeyboardInput(key);
                break;
            case CAMERA:
                ElephantScene.sceneCameraRig.keyboardFunc(key);
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
                ElephantScene.timer.addTime(0.4);
                break;
            case 'ArrowDown':
                ElephantScene.timer.subtractTime(0.4);
                break;
            case 'Tab':
                break;
        }
    }

    getCamera() {
        // return camera created in setupCameras;
        return ElephantScene.sceneCamera;

    }

    isCompleted() {
        return this.isComplete;
    }
    getSceneTime() {

        return ElephantScene.timer.getT();

    }
}
