class pondWater {

    constructor() {

        this.pondWaterProgramObject = null;
        this.time = 0.0;

        this.moveFactor = 0.0;

        this.waterMesh = null;
        this.normalMapTexture = null;
        this.dudvMapTexture = null;
        this.waterTexture = null;

    }

    setupProgram() {


        this.pondWaterProgramObject = new ShaderProgram(gl, ['shaders/pondWater/pondWater.vert', 'shaders/pondWater/pondWater.frag']);

        this.setupData();

    }


    setupData() {

        this.waterMesh = setupModel("pondWaterMesh", false);

        this.normalMapTexture = loadTexture("textures/pondWater/normal.jpg", false);
        this.dudvMapTexture = loadTexture("textures/pondWater/dudv.png", false);
        this.waterTexture = loadTexture("textures/pondWater/water.png", false);


    }

    //
    initPondWater() {

        this.setupProgram();

    }

    renderPondWater(lightManager) {



        //Model Loading
        var modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -1.8, 0.0]);
        mat4.scale(modelMatrix, modelMatrix, [180.0, 140.0, 140.0]);
        this.pondWaterProgramObject.use();

        gl.uniformMatrix4fv(this.pondWaterProgramObject.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(this.pondWaterProgramObject.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniformMatrix4fv(this.pondWaterProgramObject.getUniformLocation("mMat"), false, modelMatrix);
        gl.uniform1f(this.pondWaterProgramObject.getUniformLocation("uTime"), this.time);

        gl.uniform1f(this.pondWaterProgramObject.getUniformLocation("moveFactor"), this.moveFactor);

        gl.uniform3fv(this.pondWaterProgramObject.getUniformLocation("viewPos"), currentCamera.getPosition());
        lightManager.updateLights(this.pondWaterProgramObject.programObject);


        //for models with no texture
        let whiteTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
        let whitePixel = new Uint8Array([150, 200, 200, 255]);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whitePixel);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.waterTexture);
        gl.uniform1i(this.pondWaterProgramObject.getUniformLocation("samplerDiffuse"), 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.normalMapTexture);
        gl.uniform1i(this.pondWaterProgramObject.getUniformLocation("normalMap"), 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.dudvMapTexture);
        gl.uniform1i(this.pondWaterProgramObject.getUniformLocation("dudvMap"), 2);



        renderModel(this.waterMesh, this.pondWaterProgramObject, true);


    }

    updatePondWater() {

        this.time += GLOBAL.deltaTime * 0.0001;
        this.moveFactor += GLOBAL.deltaTime * 0.1;
        if (this.moveFactor > 1.0)
            this.moveFactor = 0.0;

    }

    uninitPondWater() {

    }
}

