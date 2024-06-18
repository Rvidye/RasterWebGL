class drawModels {

    constructor() {

        this.modelProgram = null;
        this.time = 0.0;
        this.modelMatrixArray = [];
        this.modelsArray = [];


    }

    setupProgram() {


        this.modelProgram = new ShaderProgram(gl, ['shaders/model/staticModel.vert', 'shaders/model/celShader.frag']);

        this.setupData();

    }


    setupData() {



    }

    //
    initDrawModels() {
        this.setupProgram();
    }

    renderShadow(shadowProgram, model, modelMatrixArray,) {

        modelMatrixArray.forEach(mMat => {
            gl.uniformMatrix4fv(shadowProgram.getUniformLocation("mMat"), false, mMat);
            renderModel(model, shadowProgram, true);

        });

    }

    renderModels(model, diffuseTexture, modelMatrixArray, lightManager) {



        //Model Loading
        this.modelProgram.use();


        gl.uniformMatrix4fv(this.modelProgram.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(this.modelProgram.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniform3fv(this.modelProgram.getUniformLocation("viewPos"), currentCamera.getPosition());
        lightManager.updateLights(this.modelProgram.programObject);


        /*
                let whiteTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, whiteTexture);
                let whitePixel = new Uint8Array([255, 255, 255, 255]);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whitePixel);
        */

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, diffuseTexture);
        gl.uniform1i(this.modelProgram.getUniformLocation("samplerDiffuse"), 0);


        modelMatrixArray.forEach(mMat => {
            gl.uniformMatrix4fv(this.modelProgram.getUniformLocation("mMat"), false, mMat);
            renderModel(model, this.modelProgram, true, false);

        });


    }

    updateDrawModels() {

        this.time += GLOBAL.deltaTime;

    }
    uninitDrawModels() {

    }
}

