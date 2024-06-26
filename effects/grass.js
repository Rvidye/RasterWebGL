"use strict"


class grass {

    constructor(grassBladeNumX, grassBladeNumY, grassPatchSize) {

        this.programTransformFeedbackGrass = null;
        this.programRenderGrass = null;
        this.NUM_GRASS_BLADES_X = grassBladeNumX;
        this.NUM_GRASS_BLADES_Y = grassBladeNumY;


        this.GRASS_BLADES = this.NUM_GRASS_BLADES_X * this.NUM_GRASS_BLADES_Y;
        this.GRASS_BLADES_VERTICES = 15;
        this.GRASS_PATCH_SIZE = grassPatchSize;



        //this.bladePos = new Float32Array(this.GRASS_BLADES * 4 * 4);

        //Grass Rendering Related Variables
        this.vaoGrass = null;
        this.vboBladePos = null;
        this.vboWinDir = null;
        this.vboWinLeanAngle = null;
        this.vbofAngleY = null;
        this.vboDepthOfBlade = null;

        this.time = 0.0;


        //Tranform FeedBack
        this.transformFeedBackShaderProgram = null;
        this.tfo = null;
        this.tf_vao = null;
        this.tfbo_windDir = null;
        this.tfbo_windLeanAngle = null;
        this.tfbo_fAngleY = null;
        this.tfbo_depthOfBlade = null;
    }

    setupProgram() {
        this.programRenderGrass = new ShaderProgram(gl, ['shaders/grass/grass.vert', 'shaders/grass/grass.frag']);

        this.programTransformFeedbackGrass = new ShaderProgram(gl, ['shaders/grass/grassTrandformFeedback.vert', 'shaders/grass/grassTrandformFeedback.frag']);
        //Set out Varying Attributes
        const varyings = [
            "windDir",
            "windLeanAngle",
            "fAngleY",
            "depthOfBlade"
        ];
        gl.transformFeedbackVaryings(this.programTransformFeedbackGrass.programObject, varyings, gl.SEPARATE_ATTRIBS);

        this.programTransformFeedbackGrass.linkProgram();
        this.programTransformFeedbackGrass.queryUniforms();
    }

    initGrass(bladeInstancePosition, baseColor, tipColor) {

        this.setupProgram();

        let bladePos = bladeInstancePosition;

        var blade_vertices = new Float32Array([

            -0.397033, 0.0, 0.000000,
            0.397033, 0.0, 0.000000,

            -0.329723, -0.381883 + 1.5, 0.000000,
            0.283022, -0.381883 + 1.5, 0.000000,

            -0.249048, 0.805521 + 1.5, 0.000000,
            0.209145, 0.805521 + 1.5, 0.000000,

            -0.214588, 1.401138 + 1.5, 0.000000,
            0.181484, 1.401138 + 1.5, 0.000000,

            -0.180128, 1.996755 + 1.5, 0.000000,
            0.176335, 1.996755 + 1.5, 0.000000,


            -0.144957, 2.591414 + 1.5, 0.000000,
            0.155343, 2.591414 + 1.5, 0.000000,
            -0.109787, 3.186074 + 1.5, 0.000000,
            0.134352, 3.186074 + 1.5, 0.000000,
            0.000000, 4.465777 + 1.5, 0.000000

        ]);

        let blade_color = [];

        // let baseColor = new Float32Array([0.06, 0.29, 0.02]);
        // let tipColor = new Float32Array([0.07, 1.0, 0.0]);

        for (let i = 1; i < blade_vertices.length; i += 3) {

            let color = colorLerp(baseColor, tipColor, blade_vertices[i] / (4.465777 + 1.5));
            blade_color.push(color[0]);
            blade_color.push(color[1]);
            blade_color.push(color[2]);
        }



        this.vaoGrass = gl.createVertexArray();
        gl.bindVertexArray(this.vaoGrass);

        //Non Instanced -> blade vertices
        //Create vbo
        let vboBladeVertices = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vboBladeVertices);
        gl.bufferData(gl.ARRAY_BUFFER, blade_vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        //For Color
        let vboColor = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vboColor);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blade_color), gl.STATIC_DRAW);
        gl.vertexAttribPointer(6, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(6);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);


        function createDynamicInstnceBufferObject(index, size, sizeBytes_or_data, isDynamic) {
            let vbo = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bufferData(gl.ARRAY_BUFFER, sizeBytes_or_data, (isDynamic == true) ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
            gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(index);
            //Instanced Attribute
            gl.vertexAttribDivisor(index, 1);

            return vbo;
        }

        //Instnaced Blade Position
        this.vboBladePos = createDynamicInstnceBufferObject(1, 3, new Float32Array(bladePos), false);

        //Win direction
        this.vboWinDir = createDynamicInstnceBufferObject(2, 1, this.GRASS_BLADES * 4, true);

        //wind Lean Angle
        this.vboWinLeanAngle = createDynamicInstnceBufferObject(3, 1, this.GRASS_BLADES * 4, true);

        //Y Rotation
        this.vbofAngleY = createDynamicInstnceBufferObject(4, 1, this.GRASS_BLADES * 4, true);

        //Dpeth of Blade
        this.vboDepthOfBlade = createDynamicInstnceBufferObject(5, 1, this.GRASS_BLADES * 4, true);

        gl.bindVertexArray(null);




        //vao and vbo for tranformFeedback
        this.tf_vao = gl.createVertexArray();
        gl.bindVertexArray(this.tf_vao);

        var vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bladePos), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindVertexArray(null);


        //tfo
        this.tfo = gl.createTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.tfo);


        function create_tfbo(size, index) {

            var tfbo = gl.createBuffer();
            gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, tfbo);
            gl.bufferData(gl.TRANSFORM_FEEDBACK_BUFFER, size, gl.DYNAMIC_READ);
            gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, index, tfbo);

            return tfbo;
        }

        //Wind Direction
        this.tfbo_windDir = create_tfbo(this.GRASS_BLADES * 4, 0);

        //wind Lean Angle
        this.tfbo_windLeanAngle = create_tfbo(this.GRASS_BLADES * 4, 1);

        //Blade Y Rotation
        this.tfbo_fAngleY = create_tfbo(this.GRASS_BLADES * 4, 2);

        //Depth OF Blade
        this.tfbo_depthOfBlade = create_tfbo(this.GRASS_BLADES * 4, 3);

        gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    }

    renderGrass() {
        // Render Grass
        this.programRenderGrass.use();
        gl.uniformMatrix4fv(this.programRenderGrass.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(this.programRenderGrass.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniformMatrix4fv(this.programRenderGrass.getUniformLocation("mMat"), false, mat4.create());
        gl.bindVertexArray(this.vaoGrass);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, this.GRASS_BLADES_VERTICES, this.GRASS_BLADES);
    }

    copyBufferDataFrom_TFBO_To_VBO(tfbo, vbo, size) {
        gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, tfbo);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.copyBufferSubData(gl.TRANSFORM_FEEDBACK_BUFFER, gl.ARRAY_BUFFER, 0, 0, size);
    }

    updateGrass() {
        this.time += GLOBAL.deltaTime;

        //Transform Feedback To CalCulate Per Blade Instance Attributes
        this.programTransformFeedbackGrass.use();
        //Bind the TFO to which you want to store the out attributes
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.tfo);
        gl.enable(gl.RASTERIZER_DISCARD);
        //Set Unifroms
        gl.uniform1f(this.programTransformFeedbackGrass.getUniformLocation("uTime"), this.time);
        gl.uniformMatrix4fv(this.programTransformFeedbackGrass.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniformMatrix4fv(this.programTransformFeedbackGrass.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        //Bind vao
        gl.bindVertexArray(this.tf_vao);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, this.GRASS_BLADES);
        gl.endTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
        gl.disable(gl.RASTERIZER_DISCARD);
        //Transfer The Per Blade Attributes to Respective vbos
        this.copyBufferDataFrom_TFBO_To_VBO(this.tfbo_windDir, this.vboWinDir, this.GRASS_BLADES * 4);
        this.copyBufferDataFrom_TFBO_To_VBO(this.tfbo_windLeanAngle, this.vboWinLeanAngle, this.GRASS_BLADES * 4);
        this.copyBufferDataFrom_TFBO_To_VBO(this.tfbo_fAngleY, this.vbofAngleY, this.GRASS_BLADES * 4);
        this.copyBufferDataFrom_TFBO_To_VBO(this.tfbo_depthOfBlade, this.vboDepthOfBlade, this.GRASS_BLADES * 4);
        gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    uninitGrass() {

        this.programTransformFeedbackGrass = null;
        this.programRenderGrass = null;

        //Grass Rendering Related Variables
        this.vaoGrass = null;
        this.vboBladePos = null;
        this.vboWinDir = null;
        this.vboWinLeanAngle = null;
        this.vbofAngleY = null;
        this.vboDepthOfBlade = null;

        this.time = 0.0;

        //Tranform FeedBack
        this.transformFeedBackShaderProgram = null;
        this.tfo = null;
        this.tf_vao = null;
        this.tfbo_windDir = null;
        this.tfbo_windLeanAngle = null;
        this.tfbo_fAngleY = null;
        this.tfbo_depthOfBlade = null;
    }
}




