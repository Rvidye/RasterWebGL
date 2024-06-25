"use strict"

var startScene = {
    programPhongShader: null,
    programCelShader: null,
    programSkyRender: null,
    programLight: null,
    modelName: null,
    modelBook: null,
    modelChild: null,
    modelMother: null,
    modelTest: null,
    modelRoom: null,
    modelAMC: null,
    modelRASTER: null,
    modelNightSky: null,
    modelPlacer: null,
    timer: null,
    skyTex: null,
    sceneCamera: null,
    sceneCameraRig: null
};

const startSceneEventIDS = {
    START_T: 0,
    AMC_TITLE_T: 1,
    GRP_TITLE_T: 2,
    CAMERA1_T: 3,
    BOOK_OPEN_T: 4,
    END_T: 5
};

var test = 0.0;

class roomScene extends Scene {
    constructor() {
        super();
        this.isComplete = false;
    }

    setupProgram() {
        // Load All Shaders here
        startScene.programPhongShader = new ShaderProgram(gl, ['shaders/model/model.vert', 'shaders/model/model.frag']);
        startScene.programCelShader = new ShaderProgram(gl, ['shaders/model/model.vert', 'shaders/model/celShader.frag']);
        startScene.programLight = new ShaderProgram(gl, ['shaders/utilities/lightsrc.vert', 'shaders/utilities/lightsrc.frag']);
        startScene.programSkyRender = new ShaderProgram(gl, ['shaders/cubemap/spheremap.vert', 'shaders/model/texturedMesh.frag']);
    }

    setupCamera() {
        // Setup All Cameras here
        const positionKeyFrames = [
            //  [15.899999999999999, 2.9999999999999987, 2.4999999999999996],
            //  [13.200000000000003, 3.4999999999999996, 2.5999999999999996],
            [10.900000000000007, 3.8, 2.8],
            [7.19999999999999, 3.5000000000000018, 3.400000000000021],
            [4.899999999999999, 2.600000000000001, 4.000000000000018],
            [2.1000000000000005, 2.500000000000001, 5.20000000000001],
            [-0.5999999999999998,2.600000000000001,4.10000000000001],
            [0.3999999999999998,2.500000000000001,1.700000000000005],
            [1.5,2.0000000000000004,0.700000000000001],
            [3.8000000000000016,1.2999999999999998,0.5999999999999971],
        ];

        const frontKeyFrames = [
            // [17.70000000000002, 2.5999999999999983, 2.4000000000000004],
            //  [14.7, 3.0999999999999988, 2.5000000000000004],
            [12.100000000000003, 3.8, 2.7000000000000006],
            [8.599999999999987, 3.7000000000000015, 3.1000000000000205],
            [6.599999999999994, 3.300000000000001, 3.4000000000000172],
            [3.100000000000002, 2.3000000000000007, 4.000000000000014],
            [0.6000000000000008, 2.3000000000000007, 3.8000000000000105],
            [1.3000000000000003,1.7000000000000002,1.1000000000000045],
            [3.0000000000000018,1.0999999999999996,0.600000000000001],
            [4.300000000000002,0.6,0.6999999999999975],
        ];

        startScene.sceneCamera = new SceneCamera(positionKeyFrames, frontKeyFrames);
        startScene.sceneCameraRig = new SceneCameraRig(startScene.sceneCamera);
        startScene.sceneCameraRig.setRenderFront(true);
        startScene.sceneCameraRig.setRenderFrontPoints(true);
        startScene.sceneCameraRig.setRenderPath(true);
        startScene.sceneCameraRig.setRenderPathPoints(true);
        startScene.sceneCameraRig.setRenderPathToFront(true);
        startScene.sceneCameraRig.setScalingFactor(0.1);
    }

    init() {
        // init all resouces models, texures, buffers etc
        //startScene.modelName = setupModel("test3",true);
        startScene.modelRoom = setupModel("room1", false)
        startScene.modelBook = setupModel("book", true);
        startScene.modelChild = setupModel("child", false);
        startScene.modelMother = setupModel("mother", true);
        //startScene.modelTest = setupModel("test", true);
        startScene.modelAMC = setupModel("AMC", false);
        startScene.modelRASTER = setupModel("RASTER", false);
        startScene.modelNightSky = setupModel("nightSky", false);
        //console.log(startScene.modelTest);

        startScene.timer = new timer([
            [startSceneEventIDS.START_T, [0.0, 1.0]],
            [startSceneEventIDS.AMC_TITLE_T, [1.0, 5.0]],
            [startSceneEventIDS.GRP_TITLE_T, [4.0, 5.0]],
            [startSceneEventIDS.CAMERA1_T, [8.0, 44.0]],
            [startSceneEventIDS.BOOK_OPEN_T, [44.0, 5.0]],
            [startSceneEventIDS.END_T, [49.0, 1.0]]
        ]);

        this.lightManager = new LightManager();
        const directionalLight = new Light(0, [1.0, 1.0, 1.0], 0.1, [0, 0, 0], [0.0, -1.0, -1.0], 0.0, 0.0, 0.0, false);
        const pointLight = new Light(1, [1.0, 0.75, 0.27], 0.515, [2.0, 1.0, 0.0], [0.0, 0.0, 0.0], 20.0, 0.0, 0.0, false);

        this.lightManager.addLight(directionalLight);
        this.lightManager.addLight(pointLight);
        //this.lightManager.addLight(spotLight);

        startScene.modelPlacer = new ModelPlacer();
        startScene.modelPlacer.position = vec3.fromValues(4.02000, 0.60000, 1.89000);
        startScene.modelPlacer.rotation = vec3.fromValues(0.00, 1.50, 0.00);
        startScene.modelPlacer.scale = vec3.fromValues(0.04000, 0.04000, 0.04000);
    }

    renderShadow(shadowProgram) {
    }

    render() {

        gl.disable(gl.DEPTH_TEST);
        startScene.programSkyRender.use();
        gl.uniformMatrix4fv(startScene.programSkyRender.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(startScene.programSkyRender.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        renderModel(startScene.modelNightSky, startScene.programSkyRender, true, false);
        gl.enable(gl.DEPTH_TEST);

        if (DEBUGMODE === CAMERA) {
            startScene.sceneCameraRig.render();
        }

        var transformationMatrix = mat4.create();
        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(lerp(0.0, 50.0, startScene.timer.getEventTime(startSceneEventIDS.AMC_TITLE_T)), 2.50, 2.00));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00);
        mat4.rotateY(transformationMatrix, transformationMatrix, -1.50);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(1.00, 1.00, 1.00));

        startScene.programLight.use();
        gl.uniformMatrix4fv(startScene.programLight.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(startScene.programLight.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniform3fv(startScene.programLight.getUniformLocation("lightcolor"), [1.0, 0.5, 0.0]);
        if (!startScene.timer.isEventComplete(startSceneEventIDS.AMC_TITLE_T)) {
            gl.uniformMatrix4fv(startScene.programLight.getUniformLocation("mMat"), false, transformationMatrix);
            renderModel(startScene.modelAMC, startScene.programLight, false, false);
        }

        if (!startScene.timer.isEventComplete(startSceneEventIDS.GRP_TITLE_T)) {
            mat4.identity(transformationMatrix);
            mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(lerp(0.0, 50.0, startScene.timer.getEventTime(startSceneEventIDS.GRP_TITLE_T)), 2.50, 2.00));
            mat4.rotateX(transformationMatrix, transformationMatrix, 0.00);
            mat4.rotateY(transformationMatrix, transformationMatrix, -1.50);
            mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00);
            mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(1.00, 1.00, 1.00));
            gl.uniformMatrix4fv(startScene.programLight.getUniformLocation("mMat"), false, transformationMatrix);
            renderModel(startScene.modelRASTER, startScene.programLight, false, false);
        }

        startScene.programCelShader.use();
        gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniform3fv(startScene.programCelShader.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(startScene.programCelShader.programObject);
        gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("mMat"), false, mat4.create());
        renderModel(startScene.modelRoom, startScene.programCelShader, true, true);

        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(4.18000, 0.60000, 0.77000));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00000);
        mat4.rotateY(transformationMatrix, transformationMatrix, 1.50000);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00000);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(0.04000, 0.04000, 0.04000));
        gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
        uploadBoneMatrices(startScene.modelBook, startScene.programCelShader, 0);
        renderModel(startScene.modelBook, startScene.programCelShader, true);

        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(3.77, 1.10, 2.27));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00);
        mat4.rotateY(transformationMatrix, transformationMatrix, -3.30);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(1.40, 1.40, 1.40));
        gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
        renderModel(startScene.modelChild, startScene.programCelShader, true);

        // mat4.identity(transformationMatrix);
        // mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(3.70, 1.50, 2.50));
        // mat4.rotateX(transformationMatrix, transformationMatrix, 0.00);
        // mat4.rotateY(transformationMatrix, transformationMatrix, -2.50);
        // mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00);
        // mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(1.60, 1.60, 1.60));
        // gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
        // renderModel(startScene.modelMother, startScene.programCelShader, true);

        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(4.84, -0.22, 2.62));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00);
        mat4.rotateY(transformationMatrix, transformationMatrix, -2.50);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(0.017, 0.017, 0.017));
        gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
        uploadBoneMatrices(startScene.modelMother, startScene.programCelShader, 0);
        renderModel(startScene.modelMother, startScene.programCelShader, true);

        //gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("mMat"), false, startScene.modelPlacer.getTransformationMatrix());
        //lightRenderer.renderLights(this.lightManager);
    }

    update() {
        startScene.timer.increment();

        startScene.sceneCamera.setT(startScene.timer.getEventTime(startSceneEventIDS.CAMERA1_T));

        updateModel(startScene.modelMother, 0, GLOBAL.deltaTime);
        startScene.modelBook.lerpAnimations(0, lerp(0.0, 0.7, startScene.timer.getEventTime(startSceneEventIDS.BOOK_OPEN_T)));
        // Fade IN This condition ensures that only change fade when start event is started and it not completed.
        if (startScene.timer.isEventStarted(startSceneEventIDS.START_T) && !startScene.timer.isEventComplete(startSceneEventIDS.START_T)) {
            globalFade = 1.0 - startScene.timer.getEventTime(startSceneEventIDS.START_T);
        }

        if (startScene.timer.isEventStarted(startSceneEventIDS.END_T) && !startScene.timer.isEventComplete(startSceneEventIDS.END_T)) {
            globalFade = startScene.timer.getEventTime(eventIDS.END_T);
        }

        if (startScene.timer.isEventComplete(startSceneEventIDS.END_T)) {
            this.isComplete = true;
        }
    }

    renderUI() {
        switch (DEBUGMODE) {
            case MODEL:
                startScene.modelPlacer.renderUI();
                break;
            case CAMERA:
                startScene.sceneCameraRig.renderUI();
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
        startScene.timer.reset();
    }

    unint() {
        // clean eveything created in init
    }

    keyboardfunc(key) {
        switch (DEBUGMODE) {
            case MODEL:
                startScene.modelPlacer.handleKeyboardInput(key);
                break;
            case CAMERA:
                startScene.sceneCameraRig.keyboardFunc(key);
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
                startScene.timer.addTime(0.4);
                break;
            case 'ArrowDown':
                startScene.timer.subtractTime(0.4);
                break;
            case 'Tab':
                break;
        }
    }

    getCamera() {
        // return camera created in setupCameras;
        return startScene.sceneCamera;
    }

    isCompleted() {
        return this.isComplete;
    }

    getSceneTime() {
        return startScene.timer.getT()
    }
}
