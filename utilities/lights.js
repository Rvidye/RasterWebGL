"use strict"

class Light {
    constructor(type, color = [1, 1, 1], intensity = 1.0, position = [0, 0, 0], direction = [0, 0, 0], range = 0.0, spotAngle = 0.0, spotExponent = 0.0, castShadows=false) {
        this.type = type;
        this.color = color;
        this.intensity = intensity;
        this.position = position;
        this.direction = direction;
        this.range = range;
        this.spotAngle = spotAngle;
        this.spotExponent = spotExponent;
        this.shadows = castShadows;
        this.shadowIndex = 0;
    }

    setShadowCasting(enable, shadowMapManager) {
        this.castsShadow = enable;
        if (enable) {
            shadowMapManager.createShadowMapForLight(this);
        } else {
            shadowMapManager.removeShadowMapForLight(this);
        }
    }
}

class LightManager {
    constructor(maxLights = 10) {
        this.lights = [];
        this.maxLights = maxLights;
        this.shadowMapManager = new ShadowManager();
    }

    addLight(light) {
        if (this.lights.length < this.maxLights) {
            this.lights.push(light);
            if(light.shadows){
                const shadowMap = this.shadowMapManager.createShadowMapForLight(light);
                light.shadowIndex = this.shadowMapManager.getShadowMaps().length - 1;
            }
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
            gl.uniform1i(gl.getUniformLocation(program, `u_Lights[${index}].shadows`), light.shadows);

            if(light.shadows){
                const shadowMap = this.shadowMapManager.getShadowMaps()[light.shadowIndex];
                if (shadowMap) {
                    gl.uniform1i(gl.getUniformLocation(program, `u_Lights[${index}].shadowMapIndex`), light.shadowIndex);
                    let textureUnit;// Start binding from texture unit 8
                    if (light.type === 0 || light.type === 2) {
                        textureUnit = 11 + (light.shadowIndex % 3); // Use texture units 11-13 for shadow maps
                        gl.activeTexture(gl.TEXTURE0 + textureUnit); // 8 is because i want to keep first few slots open for model textures and webgl does not support bindless textures.
                        gl.bindTexture(gl.TEXTURE_2D, shadowMap.texture);
                        gl.uniform1i(gl.getUniformLocation(program, `u_ShadowMap${light.shadowIndex % 3}`), textureUnit );
                        gl.uniformMatrix4fv(gl.getUniformLocation(program, `u_LightSpaceMatrices[${light.shadowIndex % 3}]`), false, shadowMap.lightSpaceMatrix);
                    } else if (light.type === 1) {
                        textureUnit = 14 + (light.shadowIndex % 3); // Use texture units 14-16 for cube maps
                        gl.activeTexture(gl.TEXTURE0 + textureUnit); // 8 is because i want to keep first few slots open for model textures and webgl does not support bindless textures.
                        gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowMap.texture);
                        gl.uniform1i(gl.getUniformLocation(program, `u_ShadowCubeMap${light.shadowIndex % 3}`), textureUnit);
                    }
                }
            }
        });
        gl.uniform1i(gl.getUniformLocation(program, 'u_LightCount'), this.lights.length);
        // I dont know why but its needed here.
        for (let i = 0; i < 3; i++) {
            gl.uniform1i(gl.getUniformLocation(program, `u_ShadowMap${i}`), 11 + i);
            gl.uniform1i(gl.getUniformLocation(program, `u_ShadowCubeMap${i}`), 14 + i);
        }
    }

    getLight(index){
        return this.lights[index];
    }

    getShadowCatingLights(){
        return this.lights.filter(light => light.shadows);
    }

    getShadowMapManager() {
        return this.shadowMapManager;
    }

    toggleLightShadow(light, enable) {
        light.setShadowCasting(enable, this.shadowMapManager);
    }

    renderUI(){
        ImGui.Text("Light Manager Controls");
        this.lights.forEach((light, index) => {
            if (ImGui.TreeNode(`Light ${index}`)) {
                ImGui.Text(`Type: ${light.type}`);
                if (ImGui.ColorEdit3(`Color##${index}`, light.color)) {
                    // Color changed
                }
                if (ImGui.SliderFloat(`Intensity##${index}`, (value = light.intensity) => light.intensity = value, 0.0, 10.0)) {
                    // Intensity changed
                }
                if (ImGui.DragFloat3(`Position##${index}`, light.position,0.5)) {
                    // Position changed
                }
                if (light.type === 0 || light.type === 2) { // Directional light
                    if (ImGui.DragFloat3(`Direction##${index}`, light.direction,0.5)) {
                        // Direction changed
                    }
                }
                if (light.type === 1 || light.type === 2) { // Point light or spot light
                    if (ImGui.SliderFloat(`Range##${index}`, (value = light.range) => light.range = value, 0.0, 100.0)) {
                        // Range changed
                    }
                }
                if (light.type === 2) { // Spot light
                    if (ImGui.SliderFloat(`Spot Angle##${index}`, (value = light.spotAngle) => light.spotAngle = value, 0.0, 180.0)) {
                        // Spot angle changed
                    }
                    if (ImGui.SliderFloat(`Spot Exponent##${index}`, (value = light.spotExponent) => light.spotExponent = value, 0.0, 10.0)) {
                        // Spot exponent changed
                    }
                }
                // if (ImGui.Checkbox(`Cast Shadows##${index}`, (value = light.shadows) => {
                //     //this.toggleLightShadow(light, value);
                // })) {
                //     // Shadow casting changed
                // }
                ImGui.TreePop();
            }
        });
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

