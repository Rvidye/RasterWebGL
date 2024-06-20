class CubeMapRender {
    constructor(gl, vert, frag) {
        this.gl = gl;
        this.program = new ShaderProgram(gl, [vert, frag]);
        // this.cubeVao = gl.createVertexArray();
        // const VBO = gl.createBuffer();
        // const EBO = gl.createBuffer();
        // const vertexArray = new Float32Array([            
        //     -1.0, -1.0,  1.0,
        //     1.0, -1.0,  1.0,
        //     1.0,  1.0,  1.0,
        //     -1.0,  1.0,  1.0,
        //     -1.0, -1.0, -1.0,
        //     1.0, -1.0, -1.0,
        //     1.0,  1.0, -1.0,
        //     -1.0,  1.0, -1.0]
        // );
        // const faceArray = new Uint16Array([
        //     0,  1,  2,      0,  2,  3,
        //     4,  5,  6,      4,  6,  7,
        //     4,  5,  1,      4,  1,  0,
        //     7,  6,  2,      7,  2,  3,
        //     4,  7,  3,      4,  3,  0,
        //     1,  5,  6,      1,  6,  2
        // ]);
        // gl.bindVertexArray(this.cubeVao);
        // bindAndBufferData(gl, VBO, vertexArray, 0, 3);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
        // gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faceArray, gl.STATIC_DRAW);
        // gl.bindVertexArray(null);
        this.cubeMesh = setupModel("cube",false);
    }

    render(pMat, vMat, cubemapTexture) {

        var view = mat4.clone(vMat);

        gl.disable(gl.DEPTH_TEST);
        this.program.use();
        gl.uniformMatrix4fv(this.program.getUniformLocation("pMat"), false, pMat);
        gl.uniformMatrix4fv(this.program.getUniformLocation("vMat"), false, view);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
        gl.uniform1i(this.program.getUniformLocation("cubemap"), 0);
        renderModel(this.cubeMesh, this.program, false, false);
        gl.enable(gl.DEPTH_TEST);
    }
}