"use strict"

class Light {
    constructor(type, color = [1, 1, 1], intensity = 1.0, position = [0, 0, 0], direction = [0, 0, 0], range = 0.0, spotAngle = 0.0, spotExponent = 0.0) {
        this.type = type;
        this.color = color;
        this.intensity = intensity;
        this.position = position;
        this.direction = direction;
        this.range = range;
        this.spotAngle = spotAngle;
        this.spotExponent = spotExponent;
    }
}

class LightManager {
    constructor(maxLights = 10) {
        this.lights = [];
        this.maxLights = maxLights;
    }

    addLight(light) {
        if (this.lights.length < this.maxLights) {
            this.lights.push(light);
        } else {
            console.warn("Maximum number of lights reached.");
        }
    }

    updateLights(program) {
        this.lights.forEach((light, index) => {
            gl.uniform3fv(gl.getUniformLocation(program, `u_Lights[${index}].position`), light.position);
            gl.uniform3fv(gl.getUniformLocation(program, `u_Lights[${index}].direction`), light.direction);
            gl.uniform3fv(gl.getUniformLocation(program, `u_Lights[${index}].color`), light.color);
            gl.uniform1f(gl.getUniformLocation(program, `u_Lights[${index}].intensity`), light.intensity);
            gl.uniform1f(gl.getUniformLocation(program, `u_Lights[${index}].range`), light.range);
            gl.uniform1f(gl.getUniformLocation(program, `u_Lights[${index}].spotAngle`), light.spotAngle);
            gl.uniform1f(gl.getUniformLocation(program, `u_Lights[${index}].spotExponent`), light.spotExponent);
            gl.uniform1i(gl.getUniformLocation(program, `u_Lights[${index}].type`), light.type);
        });
        gl.uniform1i(gl.getUniformLocation(program, 'u_LightCount'), this.lights.length);
    }

    getLight(index){
        return this.lights[index];
    }
}

class LightRenderer{
    constructor(){
        this.shader = new ShaderProgram(gl,['shaders/utilities/lightsrc.vert','shaders/utilities/lightsrc.frag']);
        this.arrowMesh = setupModel("arrow",false);
        this.coneMesh = setupModel("cone",false);
        this.pointMesh = setupModel("point",false);
    }

    calculateRotationMatrix(direction) {
        const forward = vec3.fromValues(0, 0, -1); // Default forward (+Z)
        const dir = vec3.fromValues(direction[0],direction[1],direction[2]);

        const dot = vec3.dot(forward, dir);
        if (Math.abs(dot - (-1.0)) < 0.000001) {
            // 180-degree rotation around the up axis
            return mat4.fromQuat(mat4.create(), quat.setAxisAngle(quat.create(), vec3.fromValues(0, 1, 0), Math.PI));
        } else if (Math.abs(dot - 1.0) < 0.000001) {
            // No rotation needed
            return mat4.create();
        } else {
            const rotAxis = vec3.cross(vec3.create(), forward, dir);
            vec3.normalize(rotAxis, rotAxis);
            const rotAngle = Math.acos(dot);
            const quatRot = quat.setAxisAngle(quat.create(), rotAxis, rotAngle);
            return mat4.fromQuat(mat4.create(), quatRot);
        }
    }


    targetAt(eye, center, up) {
    const f = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), center, eye));
    const upN = vec3.normalize(vec3.create(), up);
    const s = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), f, upN));
    const u = vec3.cross(vec3.create(), s, f);

    const M = mat4.fromValues(
        s[0], u[0], -f[0], 0,
        s[1], u[1], -f[1], 0,
        s[2], u[2], -f[2], 0,
        0, 0, 0, 1
    );
    return M;
    }


    renderLights(lightManager){
        this.shader.use();
        gl.uniformMatrix4fv(this.shader.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(this.shader.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());

        lightManager.lights.forEach(light => {
            var mMat = mat4.create();
            // switch(light.type){
            //     case 0: // directional
            //     mesh = this.arrowMesh;
            //     mat4.translate(mMat, mMat, vec3.fromValues(light.position[0],light.position[1],light.position[2]));
            //     const target = vec3.add(vec3.create(), light.position, light.direction);
            //     rMat = this.targetAt(light.position, light.direction, vec3.fromValues(0, 1, 0));
            //     mat4.copy(mMat,rMat);
            //     //mat4.multiply(mMat, mMat, rMat);
            //     break;
            //     case 1: // point
            //     mesh = this.pointMesh;
            //     mat4.translate(mMat, mMat, vec3.fromValues(light.position[0],light.position[1],light.position[2]));
            //     break;
            //     case 2: // spot
            //     mesh = this.coneMesh;
            //     mat4.translate(mMat, mMat, vec3.fromValues(light.position[0],light.position[1],light.position[2]));
            //     rMat = this.calculateRotationMatrix(light.direction);
            //     mat4.multiply(mMat, mMat, rMat);
            //     break;
            // }
            mat4.translate(mMat, mMat, vec3.fromValues(light.position[0],light.position[1],light.position[2]));
            mat4.scale(mMat,mMat,vec3.fromValues(0.1,0.1,0.1));
            gl.uniformMatrix4fv(this.shader.getUniformLocation("mMat"),false, mMat);
            gl.uniform3fv(this.shader.getUniformLocation("lightcolor"), light.color);
            renderModel(this.pointMesh, this.shader, false);
        });
    }
}

