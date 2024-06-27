"use strict"

var room2Scene = {
    programPhongShader: null,
    programCelShader: null,
    programSkyRender: null,
    programLight: null,
    modelName: null,
    modelBook: null,
    modelChild: null,
    modelMother: null,
    modelRoom: null,
    modelPlacer: null,
    timer: null,
    skyTex: null,
    sceneCamera: null,
    sceneCameraRig: null,
    songStart: 0
};

const room2SceneEventIDS = {
    START_T: 0,
    CAMERA1_T: 1,
    BOOK_OPEN_T: 2,
    END_T: 3
};

var test = 0.0;

class pageChangeScene extends Scene {
    constructor() {
        super();
        this.isComplete = false;
    }

    setupProgram() {
        // Load All Shaders here
        room2Scene.programPhongShader = new ShaderProgram(gl, ['shaders/model/model.vert', 'shaders/model/model.frag']);
        room2Scene.programCelShader = new ShaderProgram(gl, ['shaders/model/model.vert', 'shaders/model/celShader.frag']);
        room2Scene.programLight = new ShaderProgram(gl, ['shaders/utilities/lightsrc.vert', 'shaders/utilities/lightsrc.frag']);
        room2Scene.programSkyRender = new ShaderProgram(gl, ['shaders/cubemap/spheremap.vert', 'shaders/model/texturedMesh.frag']);
    }

    setupCamera() {
        // Setup All Cameras here
        const positionKeyFrames = [
            [3.8000000000000016,1.2999999999999998,0.5999999999999971],
        ];

        const frontKeyFrames = [
            [4.300000000000002,0.6,0.6999999999999975],
        ];

        room2Scene.sceneCamera = new SceneCamera(positionKeyFrames, frontKeyFrames);
        room2Scene.sceneCameraRig = new SceneCameraRig(room2Scene.sceneCamera);
        room2Scene.sceneCameraRig.setRenderFront(true);
        room2Scene.sceneCameraRig.setRenderFrontPoints(true);
        room2Scene.sceneCameraRig.setRenderPath(true);
        room2Scene.sceneCameraRig.setRenderPathPoints(true);
        room2Scene.sceneCameraRig.setRenderPathToFront(true);
        room2Scene.sceneCameraRig.setScalingFactor(0.1);
    }

    init() {
        // init all resouces models, texures, buffers etc
        //room2Scene.modelName = setupModel("test3",true);
        room2Scene.modelRoom = setupModel("room1", false)
        room2Scene.modelBook = setupModel("book", true);
        room2Scene.modelChild = setupModel("child", false);
        //console.log(room2Scene.modelTest);

        room2Scene.modelRoom.meshes[3].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);
        room2Scene.modelRoom.meshes[4].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);
        room2Scene.modelRoom.meshes[5].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);
        room2Scene.modelRoom.meshes[6].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);
        room2Scene.modelRoom.meshes[7].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);
        room2Scene.modelRoom.meshes[8].meshID = vec4.fromValues(0.0,0.0,0.0,0.0);

        room2Scene.timer = new timer([
            [room2SceneEventIDS.START_T, [0.0, 2.0]],
            [room2SceneEventIDS.CAMERA1_T, [2.0, 15.0]],
            [room2SceneEventIDS.BOOK_OPEN_T, [2.0, 15.0]],
            [room2SceneEventIDS.END_T, [17.0, 2.0]]
        ]);

        this.lightManager = new LightManager();
        const directionalLight = new Light(0, [1.0, 1.0, 1.0], 0.1, [0, 0, 0], [0.0, -1.0, -1.0], 0.0, 0.0, 0.0, false);
        const pointLight = new Light(1, [1.0, 0.75, 0.27], 0.515, [2.0, 1.0, 0.0], [0.0, 0.0, 0.0], 20.0, 0.0, 0.0, false);

        this.lightManager.addLight(directionalLight);
        this.lightManager.addLight(pointLight);
        //this.lightManager.addLight(spotLight);

        room2Scene.modelPlacer = new ModelPlacer();
        room2Scene.modelPlacer.position = vec3.fromValues(4.02000, 0.60000, 1.89000);
        room2Scene.modelPlacer.rotation = vec3.fromValues(0.00, 1.50, 0.00);
        room2Scene.modelPlacer.scale = vec3.fromValues(0.04000, 0.04000, 0.04000);
    }

    renderShadow(shadowProgram) {
    }

    render() {

        if (DEBUGMODE === CAMERA) {
            room2Scene.sceneCameraRig.render();
        }

        var transformationMatrix = mat4.create();

        room2Scene.programCelShader.use();
        gl.uniformMatrix4fv(room2Scene.programCelShader.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(room2Scene.programCelShader.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniform3fv(room2Scene.programCelShader.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(room2Scene.programCelShader.programObject);
        gl.uniformMatrix4fv(room2Scene.programCelShader.getUniformLocation("mMat"), false, mat4.create());
        renderModel(room2Scene.modelRoom, room2Scene.programCelShader, true, true);

        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(4.18000, 0.60000, 0.77000));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00000);
        mat4.rotateY(transformationMatrix, transformationMatrix, 1.50000);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00000);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(0.04000, 0.04000, 0.04000));
        gl.uniformMatrix4fv(room2Scene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
        uploadBoneMatrices(room2Scene.modelBook, room2Scene.programCelShader, 0);
        renderModel(room2Scene.modelBook, room2Scene.programCelShader, true);

        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, vec3.fromValues(3.77, 1.10, 2.27));
        mat4.rotateX(transformationMatrix, transformationMatrix, 0.00);
        mat4.rotateY(transformationMatrix, transformationMatrix, -3.30);
        mat4.rotateZ(transformationMatrix, transformationMatrix, 0.00);
        mat4.scale(transformationMatrix, transformationMatrix, vec3.fromValues(1.40, 1.40, 1.40));
        gl.uniformMatrix4fv(room2Scene.programCelShader.getUniformLocation("mMat"), false, transformationMatrix);
        renderModel(room2Scene.modelChild, room2Scene.programCelShader, true);

        //gl.uniformMatrix4fv(room2Scene.programCelShader.getUniformLocation("mMat"), false, room2Scene.modelPlacer.getTransformationMatrix());
        //lightRenderer.renderLights(this.lightManager);
    }

    update() {
        room2Scene.timer.increment();

        room2Scene.sceneCamera.setT(room2Scene.timer.getEventTime(room2SceneEventIDS.CAMERA1_T));

        if (room2Scene.timer.isEventStarted(room2SceneEventIDS.START_T) && room2Scene.songStart == 0) {
            //songPlayer.currentTime = 105.0;
            room2Scene.songStart = 1;
            postProcessingSettings.enableFog = false;
        }

        this.lightManager.getLight(1).color = [lerp(1.0, 0.6, room2Scene.timer.getEventTime(room2SceneEventIDS.BOOK_OPEN_T)),lerp(0.75, 0.6, room2Scene.timer.getEventTime(room2SceneEventIDS.BOOK_OPEN_T)),lerp(0.27, 1.0, room2Scene.timer.getEventTime(room2SceneEventIDS.BOOK_OPEN_T))];

        room2Scene.modelBook.lerpAnimations(0, lerp(0.7, 1.0, room2Scene.timer.getEventTime(room2SceneEventIDS.BOOK_OPEN_T)));
        // Fade IN This condition ensures that only change fade when start event is started and it not completed.
        if (room2Scene.timer.isEventStarted(room2SceneEventIDS.START_T) && !room2Scene.timer.isEventComplete(room2SceneEventIDS.START_T)) {
            globalFade = 1.0 - room2Scene.timer.getEventTime(room2SceneEventIDS.START_T);
        }

        if (room2Scene.timer.isEventStarted(room2SceneEventIDS.END_T) && !room2Scene.timer.isEventComplete(room2SceneEventIDS.END_T)) {
            globalFade = room2Scene.timer.getEventTime(room2SceneEventIDS.END_T);
        }

        if (room2Scene.timer.isEventComplete(room2SceneEventIDS.END_T)) {
            this.isComplete = true;
        }
    }

    renderUI() {
        switch (DEBUGMODE) {
            case MODEL:
                room2Scene.modelPlacer.renderUI();
                break;
            case CAMERA:
                room2Scene.sceneCameraRig.renderUI();
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
        room2Scene.timer.reset();
    }

    unint() {
        // clean eveything created in init
    }

    keyboardfunc(key) {
        switch (DEBUGMODE) {
            case MODEL:
                room2Scene.modelPlacer.handleKeyboardInput(key);
                break;
            case CAMERA:
                room2Scene.sceneCameraRig.keyboardFunc(key);
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
                room2Scene.timer.addTime(0.4);
                break;
            case 'ArrowDown':
                room2Scene.timer.subtractTime(0.4);
                break;
            case 'Tab':
                break;
        }
    }

    getCamera() {
        // return camera created in setupCameras;
        return room2Scene.sceneCamera;
    }

    isCompleted() {
        return this.isComplete;
    }

    getSceneTime() {
        return room2Scene.timer.getT()
    }
}
