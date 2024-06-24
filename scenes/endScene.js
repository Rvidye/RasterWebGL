"use strict"

var endScene = {
    programPhongShader: null,
    programCelShader: null,
    programSkyRender: null,
    modelBook: null,
    modelChild: null,
    modelMother: null,
    modelTest: null,
    modelRoom: null,
    modelNightSky: null,
    modelEarth : null,
    modelPlacer: null,
    timer: null,
    skyTex: null,
    sceneCamera: null,
    sceneCameraRig: null,
    songStart: 0
};

const endSceneEventIDS = {
    START_T: 0,
    CAMERA1_T: 1,
    BOOK_OPEN_T: 2,
    END_T: 3
};

var test = 0.0;

class endRoomScene extends Scene {
    constructor() {
        super();
        this.isComplete = false;
    }

    setupProgram() {
        // Load All Shaders here
        endScene.programPhongShader = new ShaderProgram(gl, ['shaders/model/model.vert', 'shaders/model/model.frag']);
        endScene.programCelShader = new ShaderProgram(gl, ['shaders/model/model.vert', 'shaders/model/celShader.frag']);
        endScene.programLight = new ShaderProgram(gl, ['shaders/utilities/lightsrc.vert', 'shaders/utilities/lightsrc.frag']);
        endScene.programSkyRender = new ShaderProgram(gl, ['shaders/cubemap/spheremap.vert', 'shaders/model/texturedMesh.frag']);
    }

    setupCamera() {
        // Setup All Cameras here
        const positionKeyFrames = [
            [3.8000000000000016,1.2999999999999998,0.5999999999999971],
            [1.6,2.0000000000000004,0.400000000000001],
            [-0.1000000000000002,2.400000000000001,1.2000000000000046],
            [-2.800000000000001,2.400000000000001,1.2000000000000082]
        ];

        const frontKeyFrames = [
            [4.300000000000002,0.6,0.6999999999999975],
            [3.0000000000000018,1.0999999999999996,0.600000000000001],
            [1.1,1.7000000000000002,0.8000000000000045],
            [-1.3999999999999995,2.1000000000000005,1.3000000000000083],
        ];

        endScene.sceneCamera = new SceneCamera(positionKeyFrames, frontKeyFrames);
        endScene.sceneCameraRig = new SceneCameraRig(endScene.sceneCamera);
        endScene.sceneCameraRig.setRenderFront(true);
        endScene.sceneCameraRig.setRenderFrontPoints(true);
        endScene.sceneCameraRig.setRenderPath(true);
        endScene.sceneCameraRig.setRenderPathPoints(true);
        endScene.sceneCameraRig.setRenderPathToFront(true);
        endScene.sceneCameraRig.setScalingFactor(0.1);
    }

    init() {
        // init all resouces models, texures, buffers etc
        //endScene.modelName = setupModel("test3",true);
        endScene.modelRoom = setupModel("room1", false)
        endScene.modelBook = setupModel("book", true);
        endScene.modelChild = setupModel("child", false);
        endScene.modelMother = setupModel("mother", true);
        endScene.modelNightSky = setupModel("nightSky", false);
        endScene.modelEarth = setupModel("earth", false);
        //console.log(endScene.modelTest);

        endScene.timer = new timer([
            [endSceneEventIDS.START_T, [0.0, 1.0]],
            [endSceneEventIDS.CAMERA1_T, [1.0, 19.0]],
            [endSceneEventIDS.BOOK_OPEN_T, [1.0, 5.0]],
            [endSceneEventIDS.END_T, [23.0, 1.0]]
        ]);

        this.lightManager = new LightManager();
        const directionalLight = new Light(0, [0.0, 0.0, 1.0], 0.1, [0, 0, 0], [0.0, -1.0, -1.0], 0.0, 0.0, 0.0, false);
        const pointLight = new Light(1, [0.4, 0.8, 1.0], 0.515, [2.0, 1.0, 0.0], [0.0, 0.0, 0.0], 20.0, 0.0, 0.0, false);

        this.lightManager.addLight(directionalLight);
        this.lightManager.addLight(pointLight);

        endScene.modelPlacer = new ModelPlacer();
        endScene.modelPlacer.position = vec3.fromValues(3.77, 1.10, 2.27);
        endScene.modelPlacer.rotation = vec3.fromValues(0.00, 0.00, 0.00);
        endScene.modelPlacer.scale = vec3.fromValues(0.01, 0.01, 0.01);
    }

    renderShadow(shadowProgram) {
    }

    render() {

        if(endScene.timer.getT() < 19.00)
        {
            gl.disable(gl.DEPTH_TEST);
            endScene.programSkyRender.use();
            gl.uniformMatrix4fv(endScene.programSkyRender.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
            gl.uniformMatrix4fv(endScene.programSkyRender.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
            renderModel(endScene.modelNightSky, endScene.programSkyRender, true, false);
            gl.enable(gl.DEPTH_TEST);
        }
        if (DEBUGMODE === CAMERA) {
            endScene.sceneCameraRig.render();
        }
        var transformationMatrix = mat4.create();

        endScene.programCelShader.use();
        gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniform3fv(endScene.programCelShader.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(endScene.programCelShader.programObject);

        if(endScene.timer.getT() < 19.00)
        {
            gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("mMat"), false, mat4.create());
            renderModel(endScene.modelRoom, endScene.programCelShader, true, true);
    
            mat4.identity(transformationMatrix);
            mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(4.18000, 0.60000, 0.77000));
            mat4.rotateX(transformationMatrix, transformationMatrix, 0.00000);
            mat4.rotateY(transformationMatrix, transformationMatrix, 1.50000);
            mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00000);
            mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(0.04000, 0.04000, 0.04000));
            gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
            uploadBoneMatrices(endScene.modelBook, endScene.programCelShader, 0);
            renderModel(endScene.modelBook, endScene.programCelShader, true);

            mat4.identity(transformationMatrix);
            mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(4.47000, 0.80000, 2.27000));
            mat4.rotateX(transformationMatrix, transformationMatrix, 0.30000);
            mat4.rotateY(transformationMatrix, transformationMatrix, -3.20000);
            mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00000);
            mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(1.40000, 1.40000, 1.40000));
            gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
            renderModel(endScene.modelChild, endScene.programCelShader, true);
        }
        else{
            mat4.identity(transformationMatrix);
            mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(3.77, 1.10, 2.27));
            mat4.rotateX(transformationMatrix, transformationMatrix, 0.0);
            mat4.rotateY(transformationMatrix, transformationMatrix, test);
            mat4.rotateZ(transformationMatrix, transformationMatrix, 0.0);
            mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(0.03, 0.03, 0.03));
            gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
            renderModel(endScene.modelEarth, endScene.programCelShader, true, true);
        }

        // mat4.identity(transformationMatrix);
        // mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(4.84, -0.22, 2.62));
        // mat4.rotateX(transformationMatrix, transformationMatrix, 0.00);
        // mat4.rotateY(transformationMatrix, transformationMatrix, -2.50);
        // mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00);
        // mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(0.017, 0.017, 0.017));
        // gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
        // uploadBoneMatrices(endScene.modelMother, endScene.programCelShader, 0);
        // renderModel(endScene.modelMother, endScene.programCelShader, true);

        //gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("mMat"), false, endScene.modelPlacer.getTransformationMatrix());
        //lightRenderer.renderLights(this.lightManager);
    }

    update() {

        endScene.timer.increment();
        endScene.sceneCamera.setT(endScene.timer.getEventTime(endSceneEventIDS.CAMERA1_T));
        test += 0.1 * GLOBAL.deltaTime;
        //updateModel(endScene.modelMother,0,GLOBAL.deltaTime);

        if (endScene.timer.isEventStarted(endSceneEventIDS.START_T) && endScene.songStart == 0) {
            songPlayer.currentTime = 161.0;
            endScene.songStart = 1;
        }

        if(endScene.timer.getT() > 19.00)
        {
            this.lightManager.getLight(0).color = [1.0,1.0,1.0];
            this.lightManager.getLight(0).direction = [3.0,-1.0,-1.0];
            this.lightManager.getLight(0).intensity = 1.0;
            this.lightManager.getLight(1).color = [1.0,1.0,1.0];
            this.lightManager.getLight(1).intensity = 0.0;
        }

        endScene.modelBook.lerpAnimations(0, lerp(1.0, 0.0, endScene.timer.getEventTime(endSceneEventIDS.BOOK_OPEN_T)));
        // Fade IN This condition ensures that only change fade when start event is started and it not completed.
        if (endScene.timer.isEventStarted(endSceneEventIDS.START_T) && !endScene.timer.isEventComplete(endSceneEventIDS.START_T)) {
            globalFade = 1.0 - endScene.timer.getEventTime(endSceneEventIDS.START_T);
        }

        if (endScene.timer.isEventStarted(endSceneEventIDS.END_T) && !endScene.timer.isEventComplete(endSceneEventIDS.END_T)) {
            globalFade = endScene.timer.getEventTime(eventIDS.END_T);
        }

        if (endScene.timer.isEventComplete(endSceneEventIDS.END_T)) {
            this.isComplete = true;
        }
    }

    renderUI() {
        switch (DEBUGMODE) {
            case MODEL:
                endScene.modelPlacer.renderUI();
                break;
            case CAMERA:
                endScene.sceneCameraRig.renderUI();
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
        endScene.timer.reset();
    }

    unint() {
        // clean eveything created in init
    }

    keyboardfunc(key) {
        switch (DEBUGMODE) {
            case MODEL:
                endScene.modelPlacer.handleKeyboardInput(key);
                break;
            case CAMERA:
                endScene.sceneCameraRig.keyboardFunc(key);
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
                endScene.timer.addTime(0.1);
                break;
            case 'ArrowDown':
                endScene.timer.subtractTime(0.1);
                break;
            case 'Tab':
                break;
        }
    }

    getCamera() {
        // return camera created in setupCameras;
        return endScene.sceneCamera;
    }

    isCompleted() {
        return this.isComplete;
    }

    getSceneTime() {
        return endScene.timer.getT()
    }
}
