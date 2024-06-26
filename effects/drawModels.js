class drawModels {

    constructor() {
        this.modelProgram = null;
        this.time = 0.0;
        this.modelMatrixArray = [];
        this.modelsArray = [];
        this.instanceBuffer = null;
    }

    setupProgram() {
        this.modelProgram = new ShaderProgram(gl, ['shaders/model/staticModel.vert', 'shaders/model/celShader.frag']);
        this.setupData();
    }

    setupData() {
        this.instanceBuffer = gl.createBuffer();
    }

    initDrawModels() {
        this.setupProgram();
    }

    renderShadow(shadowProgram, model, modelMatrixArray) {
        // modelMatrixArray.forEach(mMat => {
        //     gl.uniformMatrix4fv(shadowProgram.getUniformLocation("mMat"), false, mMat);
        //     renderModel(model, shadowProgram, true);
        // });
    }

    updateInstanceBuffer(modelMatrixArray) {

        const flattenedMatrices = new Float32Array(modelMatrixArray.length * 16);
        for (let i = 0; i < modelMatrixArray.length; i++) {
            flattenedMatrices.set(modelMatrixArray[i], i * 16);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flattenedMatrices, gl.DYNAMIC_DRAW);
    }

    renderModels(model, diffuseTexture, modelMatrixArray, lightManager) {

        this.updateInstanceBuffer(modelMatrixArray);

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
        gl.uniformMatrix4fv(this.modelProgram.getUniformLocation("mMat"), false, mat4.create());
        // modelMatrixArray.forEach(mMat => {
        //     gl.uniformMatrix4fv(this.modelProgram.getUniformLocation("mMat"), false, mMat);
        //     renderModel(model, this.modelProgram, true, false);
        // });
        renderModel(model, this.modelProgram, true, false, modelMatrixArray.length, this.instanceBuffer);
    }

    updateDrawModels() {

        this.time += GLOBAL.deltaTime;
    }

    uninitDrawModels() {
        this.modelProgram = null;
        this.time = 0.0;
        this.modelMatrixArray = null;
        this.modelsArray = null;
    }
}

