"use strict"

var tutorialScene ={
    program : null,
    model : null,
    mytimer : null
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
        tutorialScene.program = new ShaderProgram(gl,['shaders/model/model.vert','shaders/model/model.frag']);
    }

    setupCamera() 
    {
        // Setup All Cameras here
    }

    init() 
    {
        // init all resouces models, texures, buffers etc
        tutorialScene.model = initalizeModel("test2");

        tutorialScene.mytimer = new timer([
            [eventIDS.START_T,[0.0,1.0]],
            [eventIDS.MOVE_T,[1.0,5.0]],
            [eventIDS.END_T,[5.0,2.0]]
        ]);
    }

    render() 
    {
        tutorialScene.program.use();
        gl.uniformMatrix4fv(tutorialScene.program.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(tutorialScene.program.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());
    
        for (let z = -1; z <= 1; ++z) 
        {
            for (let y = -1; y <= 1; ++y) 
            {
                for (let x = -1; x <= 1; ++x) 
                {
                    if (x === 0 && y === 0 && z === 0) {
                        continue;
                    }
                    var model = mat4.create();
                    mat4.translate(model, mat4.create(), vec3.fromValues(x * 3, y * 3, z * 3));
                    gl.uniformMatrix4fv(tutorialScene.program.getUniformLocation("mMat"),false, model);
                    renderModel(tutorialScene.model);
                }
            }
        }
    }

    update() 
    {
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
