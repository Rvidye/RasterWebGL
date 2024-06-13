
class atmScattering {

    constructor() {
        //  this.viewMatrix = viewMatrix;
        // this.projMatrix = projMatrix;

        this.atmScatteringProgramObject = null;
        this.fbo = null;
        this.fboColorTexture = null;
        this.projMatrix = null;

        this.textureWidth = 1920;
        this.textureHeight = 1080;

        this.spProgramObject = null;

        this.atmRadius = 200.0;

        //data
        this.sphere = null;
        this.vaoSquare = null;

        //
        this.time = 10.0;


        //model loading
        this.sphereModel = null;
        this.modelPlacer = null;
        this.modelProgram = null;

        this.lightManager = new LightManager();
        const directionalLight = new Light(0, [1.0, 1.0, 1.0], 1.0, [2000, 2000, 2000], [-1.0, 1.0, -1.0], 0.0, 0.0, 0.0);

        this.lightManager.addLight(directionalLight);

    }

    setupProgram() {

        this.atmScatteringProgramObject = new ShaderProgram(gl, ['shaders/atmosphericScattering/atm.vert', 'shaders/atmosphericScattering/atm.frag']);
        this.spProgramObject = new ShaderProgram(gl, ['shaders/atmosphericScattering/sp.vert', 'shaders/atmosphericScattering/sp.frag']);

        this.modelProgram = new ShaderProgram(gl, ['shaders/model/model.vert', 'shaders/model/model.frag']);
        this.initFBO();

        this.setupData();

    }


    setupData() {

        this.sphere = new Mesh();
        makeSphere(this.sphere, this.atmRadius, 40, 40);

        //this.sphereModel = setupModel("test4", false);

        this.modelPlacer = new ModelPlacer();

        // Declare position and color array
        var square_position = new Float32Array([
            1.0, 1.0, 0.0,
            - 1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0
        ]);

        // VAO ->Vertex array Object
        this.vaoSquare = gl.createVertexArray();
        gl.bindVertexArray(this.vaoSquare);

        // VBO for position vertex buffer object
        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, square_position, gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindVertexArray(null);


    }


    initFBO() {
        this.fbo = gl.createFramebuffer();

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

        this.fboColorTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.fboColorTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.textureWidth, this.textureHeight, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.fboColorTexture, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);



    }


    //
    initAtmScattering() {

        this.setupProgram();

    }

    renderAtmScattering() {

        //First Pass
        //Atmospheric Scattering on Screen Space square draw on fbo
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.viewport(0, 0, this.textureWidth, this.textureHeight);
        this.atmScatteringProgramObject.use();


        gl.uniform1f(this.atmScatteringProgramObject.getUniformLocation("iTime"), this.time);
        gl.uniform2f(this.atmScatteringProgramObject.getUniformLocation("iMouse"), 0.0, 0.0);


        gl.bindVertexArray(this.vaoSquare);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);


        //Second Pass
        //Mapping atmsophere scattering iamge texture on sphere
        //   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, gBuffer.fbo);
        gl.viewport(0, 0, 2048, 2048);

        //onMyResize();


        //gl.clearColor(0.0, 0.0, 0.0, 1.0);
        //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //Transformations
        // mat4.translate(modelMatrix, mat4.create(), [0.0, 0.0, 0.0]);
        var modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, -80.0, 0.0]);
        mat4.rotateX(modelMatrix, modelMatrix, -Math.PI / 2.0);



        this.spProgramObject.use();



        gl.uniformMatrix4fv(this.spProgramObject.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(this.spProgramObject.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniformMatrix4fv(this.spProgramObject.getUniformLocation("mMat"), false, modelMatrix);



        //Bind Texture Create din first Pass
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.fboColorTexture);
        gl.uniform1i(this.spProgramObject.getUniformLocation("texObj"), 0);

        this.sphere.draw();
        gl.bindTexture(gl.TEXTURE_2D, null);
        /*
        //Model Loading
        var modelMatrix = mat4.create();
        mat4.scale(modelMatrix, modelMatrix, [10.0, 10.0, 10.0]);
        mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, 0.0]);
        
        mat4.rotateX(modelMatrix, modelMatrix, Math.PI / 2.0);
        
        
        this.modelProgram.use();
        
        gl.uniformMatrix4fv(this.modelProgram.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(this.modelProgram.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniformMatrix4fv(this.modelProgram.getUniformLocation("mMat"), false, modelMatrix);
        gl.uniform3fv(this.modelProgram.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(this.modelProgram.programObject);
        
        //  gl.activeTexture(gl.TEXTURE0);
        //   gl.bindTexture(gl.TEXTURE_2D, this.fboColorTexture);
        // gl.uniform1i(this.modelProgram.getUniformLocation("samplerDiffuse"), 0);
        
        renderModel(this.sphereModel, this.modelProgram, true);
        */

    }

    updateAtmScattering() {

        this.time += GLOBAL.deltaTime * 0.001;
        /// this.time = 8.5;

        // console.log(this.time);
    }
}

