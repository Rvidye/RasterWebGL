"use strict"

var tutorialScene ={
    programNodeAnimatedModel : null,
    programSkeletalAnimatedModel : null,
    modelNodeBased : null,
    modelSkeletalBased : null,
    modelPlacer : null,
    mytimer : null,
    sceneCamera : null,
    sceneCameraRig : null
};

const eventIDS = {
    START_T:0,
    MOVE_T:1,
    END_T:2
};
class tutorial extends Scene
{
    constructor()
    {
        super();
        this.isComplete = false;
    }
    setupProgram() 
    {
        // Load All Shaders here
        tutorialScene.programNodeAnimatedModel = new ShaderProgram(gl,['shaders/model/model.vert','shaders/model/model.frag']);
        tutorialScene.programSkeletalAnimatedModel = new ShaderProgram(gl,['shaders/model/model.vert','shaders/model/celShader.frag']);
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

        tutorialScene.sceneCamera = new SceneCamera(positionKeyFrames, frontKeyFrames);
        tutorialScene.sceneCameraRig = new SceneCameraRig(tutorialScene.sceneCamera);
        tutorialScene.sceneCameraRig.setRenderFront(true);
        tutorialScene.sceneCameraRig.setRenderFrontPoints(true);
        tutorialScene.sceneCameraRig.setRenderPath(true);
        tutorialScene.sceneCameraRig.setRenderPathPoints(true);
        tutorialScene.sceneCameraRig.setRenderPathToFront(true);
        tutorialScene.sceneCameraRig.setScalingFactor(0.1);
    }

    init() 
    {
        // init all resouces models, texures, buffers etc
        tutorialScene.modelNodeBased = setupModel("test2",false);
        tutorialScene.modelSkeletalBased = setupModel("test3",true);

        tutorialScene.mytimer = new timer([
            [eventIDS.START_T,[0.0,1.0]],
            [eventIDS.MOVE_T,[1.0,5.0]],
            [eventIDS.END_T,[5.0,2.0]]
        ]);

        this.lightManager = new LightManager();
        const directionalLight = new Light(0, [1.0, 1.0, 1.0], 1.0, [0, 0, 0], [0.0, 0.0, -1.0],0.0,0.0,0.0,true);
        const pointLight = new Light(1, [1.0, 0.0, 0.0], 2.0, [0.0, 0.0, 0.0],[0.0, 0.0, 0.0],20.0,0.0,0.0,false);
        const spotLight = new Light(2, [0.0, 1.0, 0.0], 1.0, [1.0, 0.0, -3.0], [0.0, 0.0, -1.0], 5.0, Math.cos(Math.PI / 16), 64,false);

        this.lightManager.addLight(directionalLight);
        this.lightManager.addLight(pointLight);
        this.lightManager.addLight(spotLight);

        tutorialScene.modelPlacer = new ModelPlacer();
        // Set initial position, rotation, and scale for the model (if needed)
        // tutorialScene.modelPlacer.setPosition(-1.0, 0.0, -5.0);
        // tutorialScene.modelPlacer.setRotation(0.0, 0.0, 0.0);
        // tutorialScene.modelPlacer.setScale(1.0, 1.0, 1.0);
    }

    renderShadow(shadowProgram){
        // Not sure best way to do this and increases extra work on developer side but at this point fuck it ...
        // make sure to keep this and render function transformation in sync ...

        var mMat = mat4.create();
        mat4.identity(mMat);
        mat4.translate(mMat, mMat, vec3.fromValues(0.00, 0.00, -6.0));
        gl.uniformMatrix4fv(shadowProgram.getUniformLocation("mMat"),false, mMat);
        uploadBoneMatrices(tutorialScene.modelSkeletalBased,shadowProgram,0);
        renderModel(tutorialScene.modelSkeletalBased, shadowProgram, false);
        
        mat4.translate(mMat, mat4.create(), vec3.fromValues(1.0, 0.0, -5.0));
        gl.uniformMatrix4fv(shadowProgram.getUniformLocation("mMat"),false, tutorialScene.modelPlacer.getTransformationMatrix());
        uploadBoneMatrices(tutorialScene.modelSkeletalBased,shadowProgram,0);
        renderModel(tutorialScene.modelSkeletalBased, shadowProgram, false);
    }
    
    render() {

        if(DEBUGMODE === CAMERA){
            tutorialScene.sceneCameraRig.render();
        }

        var mMat = mat4.create();
        mat4.identity(mMat);
        mat4.translate(mMat, mMat, vec3.fromValues(0.00, 0.00, -6.0));
        //mat4.translate(mMat, mat4.create(), vec3.fromValues(-1.0, 0.0, -5.0));

        tutorialScene.programNodeAnimatedModel.use();
        gl.uniformMatrix4fv(tutorialScene.programNodeAnimatedModel.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(tutorialScene.programNodeAnimatedModel.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());
        gl.uniformMatrix4fv(tutorialScene.programNodeAnimatedModel.getUniformLocation("mMat"),false, mMat);
        gl.uniform3fv(tutorialScene.programNodeAnimatedModel.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(tutorialScene.programNodeAnimatedModel.programObject);
        uploadBoneMatrices(tutorialScene.modelSkeletalBased,tutorialScene.programNodeAnimatedModel,0);
        renderModel(tutorialScene.modelSkeletalBased, tutorialScene.programNodeAnimatedModel, true);

        mat4.translate(mMat, mat4.create(), vec3.fromValues(1.0, 0.0, -5.0));
        tutorialScene.programSkeletalAnimatedModel.use();
        gl.uniformMatrix4fv(tutorialScene.programSkeletalAnimatedModel.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(tutorialScene.programSkeletalAnimatedModel.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());
        gl.uniformMatrix4fv(tutorialScene.programSkeletalAnimatedModel.getUniformLocation("mMat"),false, tutorialScene.modelPlacer.getTransformationMatrix());
        gl.uniform3fv(tutorialScene.programSkeletalAnimatedModel.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(tutorialScene.programSkeletalAnimatedModel.programObject);
        uploadBoneMatrices(tutorialScene.modelSkeletalBased,tutorialScene.programSkeletalAnimatedModel,0);
        renderModel(tutorialScene.modelSkeletalBased, tutorialScene.programSkeletalAnimatedModel, true);

        lightRenderer.renderLights(this.lightManager);
    }

    update() 
    {
        tutorialScene.sceneCamera.setT(tutorialScene.mytimer.getEventTime(eventIDS.MOVE_T));
        //updateModel(tutorialScene.modelNodeBased,0,GLOBAL.deltaTime);
        updateModel(tutorialScene.modelSkeletalBased,0,GLOBAL.deltaTime);
        tutorialScene.mytimer.increment();
        if(tutorialScene.mytimer.isEventComplete(eventIDS.END_T)){
            //this.isComplete = true;
        }
        //console.log(tutorialScene.mytimer.getT());
    }

    renderUI(){
        switch(DEBUGMODE){
            case MODEL:
                tutorialScene.modelPlacer.renderUI();
            break;
            case CAMERA:
                tutorialScene.sceneCameraRig.renderUI();
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
        tutorialScene.mytimer.reset();
    }

    unint() 
    {
        // clean eveything created in init
    }

    keyboardfunc(key) 
    {
        switch(DEBUGMODE){
            case MODEL:
                tutorialScene.modelPlacer.handleKeyboardInput(key);
            break;
            case CAMERA:
                cameraRig.keyboardFunc(key);
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
                tutorialScene.mytimer.addTime(0.4);
            break;
            case 'ArrowDown':
                tutorialScene.mytimer.subtractTime(0.4);
            break;
            case 'Tab':
            break;
        }
    }

    getCamera() 
    {
        // return camera created in setupCameras;
        return scenecamera;
    }

    isCompleted() 
    {
        return this.isComplete;
    }
}
