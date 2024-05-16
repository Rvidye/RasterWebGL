"use strict"

class ShaderProgram{

    constructor(gl, shaderFilePaths){

        this.gl = gl;
        this.programObject = gl.createProgram();
        this.uniforms = {};

        shaderFilePaths.forEach(filePath => {
            const shader = this.compileShader(filePath);
            this.gl.attachShader(this.programObject, shader);
        });

        this.linkProgram();
        this.queryUniforms();
    }

    compileShader(source){
        console.log("Loading ", source);
        const shaderType = this.getShaderType(source);
        var shader = gl.createShader(shaderType);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", source, false);
        xhr.overrideMimeType("text/plain");
        xhr.send();
        gl.shaderSource(shader, xhr.responseText);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    getShaderType(filePath) {
        const extension = filePath.split('.').pop();
        if (extension === 'vert') {
            return this.gl.VERTEX_SHADER;
        } else if (extension === 'frag') {
            return this.gl.FRAGMENT_SHADER;
        } else {
            throw new Error('Unsupported shader type');
        }
    }

    linkProgram(){
        this.gl.linkProgram(this.programObject);
        if (!this.gl.getProgramParameter(this.programObject, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(this.programObject));
        }
    }

    queryUniforms() {
        const numUniforms = this.gl.getProgramParameter(this.programObject, this.gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            const info = this.gl.getActiveUniform(this.programObject, i);
            this.uniforms[info.name] = this.gl.getUniformLocation(this.programObject, info.name);
        }
    }

    use() {
        this.gl.useProgram(this.programObject);
    }

    getUniformLocation(name) {
        if (name in this.uniforms) {
            return this.uniforms[name];
        } else {
            console.error(`Uniform '${name}' not found.`);
            return null;
        }
    }

};

