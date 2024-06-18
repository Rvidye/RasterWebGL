class vegetation {

    constructor() {

        this.programObject = null;
        this.time = 0.0;
        this.modelMatrixArray = [];
        this.leafTexture = null;
        this.vao = null;

    }

    setupProgram() {


        this.programObject = new ShaderProgram(gl, ['shaders/vegetation/vegetation.vert', 'shaders/vegetation/vegetation.frag']);

        this.setupData();

    }


    setupData() {

    }

    //
    initVegetation(leafTexture, modelMatrixArray) {

        this.setupProgram();
        this.leafTexture = leafTexture;
        this.modelMatrixArray = modelMatrixArray;
    }

    renderVegetation() {

        //Model Loading

        this.programObject.use();

        gl.uniformMatrix4fv(this.programObject.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(this.programObject.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());


        gl.uniform1f(this.programObject.getUniformLocation("pitch"), 1.0);
        gl.uniform1f(this.programObject.getUniformLocation("yaw"), 1.0);
        gl.uniform1f(this.programObject.getUniformLocation("bendStrength"), 0.25);
        gl.uniform1f(this.programObject.getUniformLocation("uTime"), this.time);


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.leafTexture);
        gl.uniform1i(this.programObject.getUniformLocation("texObj"), 0);

        gl.bindVertexArray(this.vao);

        this.modelMatrixArray.forEach(mMat => {
            this.time += GLOBAL.deltaTime * 0.01;
            gl.uniform1f(this.programObject.getUniformLocation("uTime"), this.time);
            gl.uniformMatrix4fv(this.programObject.getUniformLocation("mMat"), false, mMat);
            gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 12, 18);

        });


    }

    updateVegetation() {

        this.time += GLOBAL.deltaTime;

    }
}

