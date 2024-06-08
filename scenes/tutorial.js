"use strict"

var tutorialScene ={
    programNodeAnimatedModel : null,
    programSkeletalAnimatedModel : null,
    modelNodeBased : null,
    modelSkeletalBased : null,
    mytimer : null,
    lightManager : null
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
        tutorialScene.programNodeAnimatedModel = new ShaderProgram(gl,['shaders/model/model.vert','shaders/model/celShader.frag']);
        tutorialScene.programSkeletalAnimatedModel = new ShaderProgram(gl,['shaders/model/modelanim.vert','shaders/model/celShader.frag']);
    }

    setupCamera() 
    {
        // Setup All Cameras here
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

        tutorialScene.lightManager = new LightManager();
        const directionalLight = new Light(0, [1.0, 1.0, 1.0], 1.0, [0, 0, 0], [-1.0, 1.0, -1.0],0.0,0.0,0.0);
        const pointLight = new Light(1, [1.0, 0.0, 0.0], 2.0, [0.0, 0.0, 0.0],[0.0, 0.0, 0.0],5.0,0.0,0.0);
        const spotLight = new Light(2, [0.0, 1.0, 0.0], 1.0, [1.0, 0.0, -3.0], [0.0, 0.0, -1.0], 5.0, Math.cos(Math.PI / 16), 64);

        tutorialScene.lightManager.addLight(directionalLight);
        tutorialScene.lightManager.addLight(pointLight);
        tutorialScene.lightManager.addLight(spotLight);
    }

    render() 
    {
        var mMat = mat4.create();
        mat4.translate(mMat, mat4.create(), vec3.fromValues(-1.0, 0.0, -5.0));

        tutorialScene.programNodeAnimatedModel.use();
        gl.uniformMatrix4fv(tutorialScene.programNodeAnimatedModel.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(tutorialScene.programNodeAnimatedModel.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());
        gl.uniformMatrix4fv(tutorialScene.programNodeAnimatedModel.getUniformLocation("mMat"),false, mMat);
        gl.uniform3fv(tutorialScene.programNodeAnimatedModel.getUniformLocation("viewPos"), currentCamera.getPosition());
        tutorialScene.lightManager.updateLights(tutorialScene.programNodeAnimatedModel.programObject);
        renderModel(tutorialScene.modelNodeBased, tutorialScene.programNodeAnimatedModel, true);

        mat4.translate(mMat, mat4.create(), vec3.fromValues(1.0, 0.0, -5.0));
        tutorialScene.programSkeletalAnimatedModel.use();
        gl.uniformMatrix4fv(tutorialScene.programSkeletalAnimatedModel.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(tutorialScene.programSkeletalAnimatedModel.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());
        gl.uniformMatrix4fv(tutorialScene.programSkeletalAnimatedModel.getUniformLocation("mMat"),false, mMat);
        gl.uniform3fv(tutorialScene.programNodeAnimatedModel.getUniformLocation("viewPos"), currentCamera.getPosition());
        tutorialScene.lightManager.updateLights(tutorialScene.programSkeletalAnimatedModel.programObject);
        uploadBoneMatrices(tutorialScene.modelSkeletalBased,tutorialScene.programSkeletalAnimatedModel,0);
        renderModel(tutorialScene.modelSkeletalBased, tutorialScene.programSkeletalAnimatedModel, true);
        
        lightRenderer.renderLights(tutorialScene.lightManager);
    }

    update() 
    {
        //updateModel(tutorialScene.modelNodeBased,0,GLOBAL.deltaTime);
        updateModel(tutorialScene.modelSkeletalBased,0,GLOBAL.deltaTime);
        //tutorialScene.mytimer.increment();
        //if(tutorialScene.mytimer.isEventComplete(eventIDS.END_T)){
            //this.isComplete = true;
        //}
        //console.log(tutorialScene.mytimer.getT());
    }

    reset() 
    {
        // reset stuff like timers and events
    }

    unint() 
    {
        // clean eveything created in init
    }

    keyboardfunc(key) 
    {
        if(key == 'Space')
        {
            this.isComplete = true;
        }

        switch(key){
            case 'KeyI':
                tutorialScene.lightManager.getLight(1).position[2] += 1.0;
            break;
            case 'KeyK':
                tutorialScene.lightManager.getLight(1).position[2] -= 1.0;
            break;
            case 'KeyJ':
                tutorialScene.lightManager.getLight(1).position[0] += 1.0;
            break;
            case 'KeyL':
                tutorialScene.lightManager.getLight(1).position[0] -= 1.0;
            break;
        }
    }

    getCamera() 
    {
        // return camera created in setupCameras;
    }

    isCompleted() 
    {
        return this.isComplete;
    }
}
