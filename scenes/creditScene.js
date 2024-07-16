"use strict"

var creditScene = {
    programCreditFSQ : null,
    timer : null
};

const creditIDS = {
    START_T: 0,
    SONG_IN_T: 1,
    SONG_OUT_T : 2,
    TECH_IN_T : 3,
    TECH_OUT_T : 4,
    EFFECT_IN_T : 5,
    EFFECT_OUT_T : 6,
    THANKS_IN_T : 7,
    THANKS_OUT_T : 8,
    NAME_IN_T : 9,
    NAME_OUT_T : 10,
    GL_IN_T : 11,
    GL_OUT_T : 12,
    SIR_IN_T : 13,
    SIR_OUT_T : 14,
    END_T: 15
};

const creditEvents = [
    { id: creditIDS.SONG_IN_T, texture: "textures/credits-2/SongCredit-2.png" },
    { id: creditIDS.TECH_IN_T, texture: "textures/credits-2/Tech-2.png" },
    { id: creditIDS.EFFECT_IN_T, texture: "textures/credits-2/Effects-2.png" },
    { id: creditIDS.THANKS_IN_T, texture: "textures/credits-2/Thanks-2.png" },
    { id: creditIDS.NAME_IN_T, texture: "textures/credits-2/Name-2.png" },
    { id: creditIDS.GL_IN_T, texture: "textures/credits-2/GL-2.png" },
    { id: creditIDS.SIR_IN_T, texture: "textures/credits-2/Sir-2.png" },
];

class credits extends Scene {
    constructor() {
        super();
        this.isComplete = false;
        this.fade = 1.0; // 1 means black. 0 means credit
        this.textures = {};
    }
    setupProgram() {
        // Load All Shaders here
        creditScene.programCreditFSQ = new ShaderProgram(gl, ["shaders/common/FSQ.vert", "shaders/credits/Credit.frag"]);
    }

    setupCamera() {
    }

    init() {

        creditEvents.forEach(event => {
            this.textures[event.id] = loadTexture(event.texture, true);
        });
        this.currentTex = this.textures[creditIDS.SONG_IN_T];

        creditScene.timer = new timer([
            [creditIDS.START_T,[0.0,1.0]],
            [creditIDS.SONG_IN_T,[1.0,1.0]],
            [creditIDS.SONG_OUT_T,[3.0,1.0]],
            [creditIDS.TECH_IN_T,[4.0,1.0]],
            [creditIDS.TECH_OUT_T,[6.0,1.0]],
            [creditIDS.EFFECT_IN_T,[7.0,1.0]],
            [creditIDS.EFFECT_OUT_T,[9.0,1.0]],
            [creditIDS.THANKS_IN_T,[10.0,1.0]],
            [creditIDS.THANKS_OUT_T,[12.0,1.0]],
            [creditIDS.NAME_IN_T,[13.0,1.0]],
            [creditIDS.NAME_OUT_T,[15.0,1.0]],
            [creditIDS.GL_IN_T,[16.0,1.0]],
            [creditIDS.GL_OUT_T,[18.0,1.0]],
            [creditIDS.SIR_IN_T,[19.0,1.0]],
            [creditIDS.SIR_OUT_T,[21.0,1.0]],
            [creditIDS.END_T,[22.0,1.0]]
        ]);
        creditScene.timer.registerCallback(0.0, () => { postProcessingSettings.enableBloom = true, postProcessingSettings.enableOutline = false;});
        creditScene.timer.registerCallback(4.0, () => { this.currentTex = this.textures[creditIDS.TECH_IN_T]});
        creditScene.timer.registerCallback(7.0, () => { this.currentTex = this.textures[creditIDS.EFFECT_IN_T]});
        creditScene.timer.registerCallback(10.0, () => { this.currentTex = this.textures[creditIDS.THANKS_IN_T]});
        creditScene.timer.registerCallback(13.0, () => { this.currentTex = this.textures[creditIDS.NAME_IN_T]});
        creditScene.timer.registerCallback(16.0, () => { this.currentTex = this.textures[creditIDS.GL_IN_T]});
        creditScene.timer.registerCallback(19.0, () => { this.currentTex = this.textures[creditIDS.SIR_IN_T]});
    }

    renderShadow(shadowProgram) {
    }

    render() {
        creditScene.programCreditFSQ.use();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.currentTex);
        gl.uniform1i(creditScene.programCreditFSQ.getUniformLocation("screenTex"), 0);
        gl.uniform1f(creditScene.programCreditFSQ.getUniformLocation("fade"), this.fade);
        gl.bindVertexArray(emptyVao);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.bindVertexArray(null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.useProgram(null);
    }

    update() 
    {
        creditScene.timer.increment();
        // Fade IN This condition ensures that only change fade when start event is started and it not completed.
        if(creditScene.timer.isEventStarted(creditIDS.START_T) && !creditScene.timer.isEventComplete(creditIDS.START_T)){
            globalFade = 1.0 - creditScene.timer.getEventTime(creditIDS.START_T);
        }

        if(creditScene.timer.isEventStarted(creditIDS.END_T) && !creditScene.timer.isEventComplete(creditIDS.END_T)){
            globalFade = creditScene.timer.getEventTime(creditIDS.END_T);
        }

        // Fade IN Song
        if(creditScene.timer.isEventStarted(creditIDS.SONG_IN_T) && !creditScene.timer.isEventComplete(creditIDS.SONG_IN_T)){
            this.fade = 1.0 - creditScene.timer.getEventTime(creditIDS.SONG_IN_T);
        }

        if(creditScene.timer.isEventStarted(creditIDS.SONG_OUT_T) && !creditScene.timer.isEventComplete(creditIDS.SONG_OUT_T)){
            this.fade = creditScene.timer.getEventTime(creditIDS.SONG_OUT_T);
        }

        // Fade IN TECH
        if(creditScene.timer.isEventStarted(creditIDS.TECH_IN_T) && !creditScene.timer.isEventComplete(creditIDS.TECH_IN_T)){
            this.fade = 1.0 - creditScene.timer.getEventTime(creditIDS.TECH_IN_T);
        }

        if(creditScene.timer.isEventStarted(creditIDS.TECH_OUT_T) && !creditScene.timer.isEventComplete(creditIDS.TECH_OUT_T)){
            this.fade = creditScene.timer.getEventTime(creditIDS.TECH_OUT_T);
        }

        // Fade IN EFFECTS
        if(creditScene.timer.isEventStarted(creditIDS.EFFECT_IN_T) && !creditScene.timer.isEventComplete(creditIDS.EFFECT_IN_T)){
            this.fade = 1.0 - creditScene.timer.getEventTime(creditIDS.EFFECT_IN_T);
        }

        if(creditScene.timer.isEventStarted(creditIDS.EFFECT_OUT_T) && !creditScene.timer.isEventComplete(creditIDS.EFFECT_OUT_T)){
            this.fade = creditScene.timer.getEventTime(creditIDS.EFFECT_OUT_T);
        }

        // Fade IN THANKS
        if(creditScene.timer.isEventStarted(creditIDS.THANKS_IN_T) && !creditScene.timer.isEventComplete(creditIDS.THANKS_IN_T)){
            this.fade = 1.0 - creditScene.timer.getEventTime(creditIDS.THANKS_IN_T);
        }

        if(creditScene.timer.isEventStarted(creditIDS.THANKS_OUT_T) && !creditScene.timer.isEventComplete(creditIDS.THANKS_OUT_T)){
            this.fade = creditScene.timer.getEventTime(creditIDS.THANKS_OUT_T);
        }

        // Fade IN NAME
        if(creditScene.timer.isEventStarted(creditIDS.NAME_IN_T) && !creditScene.timer.isEventComplete(creditIDS.NAME_IN_T)){
            this.fade = 1.0 - creditScene.timer.getEventTime(creditIDS.NAME_IN_T);
        }

        if(creditScene.timer.isEventStarted(creditIDS.NAME_OUT_T) && !creditScene.timer.isEventComplete(creditIDS.NAME_OUT_T)){
            this.fade = creditScene.timer.getEventTime(creditIDS.NAME_OUT_T);
        }

        // Fade IN GL
        if(creditScene.timer.isEventStarted(creditIDS.GL_IN_T) && !creditScene.timer.isEventComplete(creditIDS.GL_IN_T)){
            this.fade = 1.0 - creditScene.timer.getEventTime(creditIDS.GL_IN_T);
        }

        if(creditScene.timer.isEventStarted(creditIDS.GL_OUT_T) && !creditScene.timer.isEventComplete(creditIDS.GL_OUT_T)){
            this.fade = creditScene.timer.getEventTime(creditIDS.GL_OUT_T);
        }

        // Fade IN SIR
        if(creditScene.timer.isEventStarted(creditIDS.SIR_IN_T) && !creditScene.timer.isEventComplete(creditIDS.SIR_IN_T)){
            this.fade = 1.0 - creditScene.timer.getEventTime(creditIDS.SIR_IN_T);
        }

        if(creditScene.timer.isEventStarted(creditIDS.SIR_OUT_T) && !creditScene.timer.isEventComplete(creditIDS.SIR_OUT_T)){
            this.fade = creditScene.timer.getEventTime(creditIDS.SIR_OUT_T);
        }

        if(creditScene.timer.isEventComplete(creditIDS.END_T)){
            this.isComplete = true;
        }
        //console.log(creditScene.timer.getT());
    }

    renderUI() {
        switch (DEBUGMODE) {
            case MODEL:
                break;
            case CAMERA:
                break;
            case LIGHT:
                break;
            case NONE:
                break;
        }
    }

    reset() {
        // reset stuff like timers and events
        creditScene.timer.reset();
    }

    unint() {
        // clean eveything created in init
    }

    keyboardfunc(key) {
        switch (DEBUGMODE) {
            case MODEL:
                break;
            case CAMERA:
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
                creditScene.timer.addTime(0.1);
                break;
            case 'ArrowDown':
                creditScene.timer.subtractTime(0.1);
                break;
            case 'Tab':
                break;
        }
    }

    getCamera() {
    }

    isCompleted() {
        return this.isComplete;
    }

    getSceneTime() {
        return creditScene.timer.getT()
    }

}
