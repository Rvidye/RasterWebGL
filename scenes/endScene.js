"use strict"

var endScene = {
    programPhongShader: null,
    programCelShader: null,
    programSkyRender: null,
    programQuad: null,
    modelBook: null,
    modelChild: null,
    modelMother: null,
    modelTest: null,
    modelRoom: null,
    modelNightSky: null,
    modelPlane: null,
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
        endScene.programQuad = new ShaderProgram(gl, ['shaders/cubemap/simple.vert', 'shaders/fallingstar.frag']);
    }

    setupCamera() {
        // Setup All Cameras here
        const positionKeyFrames = [
            [4.300000000000001,1.0999999999999996,2.6999999999999984],
            [3.7000000000000015,2.0000000000000004,1.4000000000000012],
            [1.8000000000000003,2.400000000000001,1.4000000000000048],
            [2.1000000000000005,2.500000000000001,5.20000000000001],
            [5.099999999999998,2.600000000000001,4.100000000000017],
            [7.599999999999989,3.1000000000000014,3.400000000000021],
            [8.199999999999987,3.600000000000002,3.500000000000021]
        ];

        const frontKeyFrames = [
            [3.9000000000000026,2.7755575615628914e-17,2.699999999999999],
            [4.100000000000002,1.2999999999999998,1.6000000000000014],
            [2.4000000000000012,1.7000000000000002,1.1000000000000045],
            [2.200000000000001,2.3000000000000007,4.000000000000014],
            [7.0999999999999925,3.200000000000001,3.4000000000000172],
            [8.999999999999986,3.5000000000000013,2.70000000000002],
            [9.199999999999985,5.799999999999995,4.40000000000002]
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
        endScene.modelChild = setupModel("childwb", false);
        endScene.modelMother = setupModel("mother", true);
        endScene.modelNightSky = setupModel("nightSky", false);
        endScene.modelEarth = setupModel("earth", false);
        endScene.modelPlane = setupModel("plane", false);
        //console.log(endScene.modelTest);

        endScene.modelRoom.meshes[3].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);
        endScene.modelRoom.meshes[4].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);
        endScene.modelRoom.meshes[5].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);
        endScene.modelRoom.meshes[6].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);
        endScene.modelRoom.meshes[7].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);
        endScene.modelRoom.meshes[8].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);

        endScene.timer = new timer([
            [endSceneEventIDS.START_T, [0.0, 1.0]],
            [endSceneEventIDS.CAMERA1_T, [0.0, 22.0]],
            [endSceneEventIDS.BOOK_OPEN_T, [0.0, 6.0]],
            [endSceneEventIDS.END_T, [23.0, 1.0]]
        ]);

        endScene.timer.registerCallback(0.0, () => { postProcessingSettings.enableOutline = false; postProcessingSettings.enableBloom = true; postProcessingSettings.enableFog = false;});

        this.lightManager = new LightManager();
        const directionalLight = new Light(0, [0.0, 0.0, 1.0], 0.1, [0, 0, 0], [0.0, -1.0, -1.0], 0.0, 0.0, 0.0, false);
        const pointLight = new Light(1, [0.4, 0.8, 1.0], 0.515, [2.0, 1.0, 0.0], [0.0, 0.0, 0.0], 20.0, 0.0, 0.0, false);

        this.lightManager.addLight(directionalLight);
        this.lightManager.addLight(pointLight);

        endScene.modelPlacer = new ModelPlacer();
        endScene.modelPlacer.position = vec3.fromValues(15.00000, 17.00000, 14.00000);
        endScene.modelPlacer.rotation = vec3.fromValues(0.00, 3.1, 0.4);
        endScene.modelPlacer.scale = vec3.fromValues(1.00000, 1.00000, 1.00000);
    }

    renderShadow(shadowProgram) {
    }

    render() {

        // if(endScene.timer.getT() < 19.00)
        // {
            gl.disable(gl.DEPTH_TEST);
            endScene.programSkyRender.use();
            gl.uniformMatrix4fv(endScene.programSkyRender.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
            gl.uniformMatrix4fv(endScene.programSkyRender.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
            renderModel(endScene.modelNightSky, endScene.programSkyRender, true, false);
            gl.enable(gl.DEPTH_TEST);
        // }
        if (DEBUGMODE === CAMERA) {
            endScene.sceneCameraRig.render();
        }

        var transformationMatrix = mat4.create();
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        endScene.programQuad.use();
        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(15.00000, 17.00000, 14.00000));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00000);
        mat4.rotateY(transformationMatrix, transformationMatrix, 0.00000);
        mat4.rotateZ(transformationMatrix, transformationMatrix, -0.40000);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(1.00000, 1.00000, 1.00000));
        gl.uniformMatrix4fv(endScene.programQuad.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(endScene.programQuad.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniformMatrix4fv(endScene.programQuad.getUniformLocation("mMat"), false, endScene.modelPlacer.getTransformationMatrix());
        gl.uniform1f(endScene.programQuad.getUniformLocation("uTime"), test);
        //gl.uniform2fv(endScene.programQuad.getUniformLocation("uResolution"), [800,450]);
        renderModel(endScene.modelPlane, endScene.programQuad, false,false);
        gl.disable(gl.BLEND);

        endScene.programCelShader.use();
        gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniform3fv(endScene.programCelShader.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(endScene.programCelShader.programObject);
        
        gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("mMat"), false, mat4.create());
        renderModel(endScene.modelRoom, endScene.programCelShader, true, true);

        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(4.22000, 0.60000, 2.48000));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00000);
        mat4.rotateY(transformationMatrix, transformationMatrix, -1.10000);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00000);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(0.04000, 0.04000, 0.04000));
        gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
        uploadBoneMatrices(endScene.modelBook, endScene.programCelShader, 0);
        renderModel(endScene.modelBook, endScene.programCelShader, true);

        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(4.77000, 0.80000, 2.27000));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00000);
        mat4.rotateY(transformationMatrix, transformationMatrix, -3.20000);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00000);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(1.40000, 1.40000, 1.40000));
        gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
        renderModel(endScene.modelChild, endScene.programCelShader, true);

        //gl.uniformMatrix4fv(endScene.programCelShader.getUniformLocation("mMat"), false, endScene.modelPlacer.getTransformationMatrix());
        //lightRenderer.renderLights(this.lightManager);
    }

    update() {

        endScene.timer.increment();
        endScene.sceneCamera.setT(endScene.timer.getEventTime(endSceneEventIDS.CAMERA1_T));
        if(endScene.timer.getT() > 22.0){
            test += 0.05;
        }
        //updateModel(endScene.modelMother,0,GLOBAL.deltaTime);

        if (endScene.timer.isEventStarted(endSceneEventIDS.START_T) && endScene.songStart == 0) {
            //songPlayer.currentTime = 161.0;
            endScene.songStart = 1;
        }

        endScene.modelBook.lerpAnimations(0, lerp(1.0, 1.0, endScene.timer.getEventTime(endSceneEventIDS.BOOK_OPEN_T)));
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
        return endScene.timer.getT();
    }
}
