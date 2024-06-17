"use strict"

var startScene ={
    programPhongShader : null,
    programCelShader : null,
    modelName : null,
    modelCat : null,
    modelRoom : null,
    modelPlacer : null,
    timer : null,
    skyTex : null,
    sceneCamera : null,
    sceneCameraRig : null
};

const startSceneEventIDS = {
    START_T:0,
    MOVE_T:1,
    END_T:2
};

class roomScene extends Scene
{
    constructor()
    {
        super();
        this.isComplete = false;
    }

    setupProgram() 
    {
        // Load All Shaders here
        startScene.programPhongShader = new ShaderProgram(gl,['shaders/model/model.vert','shaders/model/model.frag']);
        startScene.programCelShader = new ShaderProgram(gl,['shaders/model/model.vert','shaders/model/celShader.frag']);
    }

    setupCamera() 
    {
        // Setup All Cameras here
        const positionKeyFrames = [
            [0.0,0.0,5.0],   
            [0.0,0.0,4.0],   
            [0.0,0.0,3.0],   
            [0.0,0.0,2.0],   
            [0.0,0.0,1.0]
        ];

        const frontKeyFrames = [
            [0, 0, -1],
            [0, 0, -1],
            [0, 0, -1],
            [0, 0, -1],
            [0, 0, -1] 
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

    init() 
    {
        // init all resouces models, texures, buffers etc
        //startScene.modelName = setupModel("test3",true);
        startScene.modelRoom = setupModel("room1",false)
        startScene.modelCat = setupModel("book",true);

        startScene.timer = new timer([
            [startSceneEventIDS.START_T,[0.0,1.0]],
            [startSceneEventIDS.MOVE_T,[1.0,49.0]],
            [startSceneEventIDS.END_T,[49.0,1.0]]
        ]);

        this.lightManager = new LightManager();
        const directionalLight = new Light(0, [1.0, 1.0, 1.0], 1.0, [0, 0, 0], [0.0, 0.0, -1.0],0.0,0.0,0.0,true);
        const pointLight = new Light(1, [1.0, 1.0, 1.0], 1.0, [0.0, 0.0, 0.0],[0.0, 0.0, 0.0],20.0,0.0,0.0,false);
        const spotLight = new Light(2, [0.0, 1.0, 0.0], 1.0, [1.0, 0.0, -3.0], [0.0, 0.0, -1.0], 5.0, Math.cos(Math.PI / 16), 64,false);

        //this.lightManager.addLight(directionalLight);
        this.lightManager.addLight(pointLight);
        //this.lightManager.addLight(spotLight);

        startScene.modelPlacer = new ModelPlacer();
        startScene.skyTex = loadTextureCubemap("textures/sky.jpg", false);
    }

    renderShadow(shadowProgram){
    }
    
    render() {
        if(DEBUGMODE === CAMERA){
            startScene.sceneCameraRig.render();
        }

        //programCubemapRenderer.render(currentCamera.getProjectionMatrix(),currentCamera.getViewMatrix(),startScene.skyTex);

        startScene.programCelShader.use();
        gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());
        gl.uniform3fv(startScene.programCelShader.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(startScene.programCelShader.programObject);
        gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("mMat"),false, mat4.create());
        //uploadBoneMatrices(startScene.modelName,startScene.programCelShader,0);
        //renderModel(startScene.modelBed, startScene.programCelShader, true);
        renderModel(startScene.modelRoom, startScene.programCelShader, true,true);

        gl.uniformMatrix4fv(startScene.programCelShader.getUniformLocation("mMat"),false, startScene.modelPlacer.getTransformationMatrix());
        uploadBoneMatrices(startScene.modelCat,startScene.programCelShader,0);
        renderModel(startScene.modelCat, startScene.programCelShader, true);

        lightRenderer.renderLights(this.lightManager);

    }

    update() 
    {
        startScene.sceneCamera.setT(startScene.timer.getEventTime(startSceneEventIDS.MOVE_T));
        updateModel(startScene.modelCat,0,GLOBAL.deltaTime);
        startScene.timer.increment();
        if(startScene.timer.isEventComplete(startSceneEventIDS.END_T)){
            //this.isComplete = true;
        }

        // Fade IN This condition ensures that only change fade when start event is started and it not completed.
        if(startScene.timer.isEventStarted(eventIDS.START_T) && !startScene.timer.isEventComplete(eventIDS.START_T)){
            globalFade = 1.0 - startScene.timer.getEventTime(eventIDS.START_T);
        }

        if(startScene.timer.isEventStarted(eventIDS.END_T) && !startScene.timer.isEventComplete(eventIDS.END_T)){
            globalFade = startScene.timer.getEventTime(eventIDS.END_T);
        }

        if(startScene.timer.isEventComplete(eventIDS.END_T)){
            this.isComplete = true;
        }
    }

    renderUI(){
        switch(DEBUGMODE){
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

    reset() 
    {
        // reset stuff like timers and events
        startScene.timer.reset();
    }

    unint() 
    {
        // clean eveything created in init
    }

    keyboardfunc(key) 
    {
        switch(DEBUGMODE){
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
        if(key == 'Space')
        {
            //this.isComplete = true;
        }

        switch(key){
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

    getCamera() 
    {
        // return camera created in setupCameras;
        return startScene.sceneCamera;
    }

    isCompleted() 
    {
        return this.isComplete;
    }

    getSceneTime() {
        return startScene.timer.getT()
    }
}
