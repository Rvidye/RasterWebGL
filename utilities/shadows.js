"use strict"

const SHADOWMAP_SIZE = 2048;

class ShadowMap {
    constructor(lightIndex, framebuffer, texture, lightSpaceMatrix = null) {
        this.lightIndex = lightIndex;
        this.framebuffer = framebuffer;
        this.texture = texture;
        this.lightSpaceMatrix = lightSpaceMatrix;
    }
}

class ShadowManager{
    constructor(){
        this.shadowMaps = [];
    }

    createShadowMapForLight(light, lightIndex){
        let shadowFramebuffer, shadowTexture, lightSpaceMatrix = null;
        if(light.type === 0 || light.type === 2)
        {
            shadowFramebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
            shadowTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, SHADOWMAP_SIZE, SHADOWMAP_SIZE, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowTexture, 0);
            gl.drawBuffers([gl.NONE]);
            gl.readBuffer([gl.NONE]);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                console.error('Framebuffer is not complete');
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            lightSpaceMatrix = computeLightSpaceMatrix(light);
        } else if (light.type === 1) {
            shadowFramebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
            shadowTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, shadowTexture);
            for (let i = 0; i < 6; i++) {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.DEPTH_COMPONENT32F, SHADOWMAP_SIZE, SHADOWMAP_SIZE, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);
            }
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_CUBE_MAP_POSITIVE_X, shadowTexture, 0);
            gl.drawBuffers([gl.NONE]);
            gl.readBuffer([gl.NONE]);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                console.error('Framebuffer is not complete');
            }
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        const shadowMap = new ShadowMap(lightIndex, shadowFramebuffer,shadowTexture, lightSpaceMatrix);
        this.shadowMaps.push(shadowMap);
        return shadowMap;
    }

    removeShadowMapForLight(light) {
        if (this.shadowMaps.has(light)) {
            this.shadowMaps.delete(light);
        }
    }

    getShadowMaps(){
        return this.shadowMaps;
    }

}

function computeLightSpaceMatrix(light) {
    const lightProjection = mat4.create();
    const lightView = mat4.create();
    const lightSpaceMatrix = mat4.create();

    if (light.type === 0) {
        // Orthographic projection for directional lights
        const nearPlane = 1.0;
        const farPlane = 100.0;
        const left = -20.0;
        const right = 20.0;
        const bottom = -20.0;
        const top = 20.0;
        mat4.ortho(lightProjection, left, right, bottom, top, nearPlane, farPlane);

        const lightDir = vec3.normalize(vec3.create(), light.direction);
        const lightPos = vec3.scale(vec3.create(), lightDir, -30.0); // Place light far back along its direction
        const target = [0.0, 0.0, 0.0];
        const up = [0.0, 1.0, 0.0];
        mat4.lookAt(lightView, light.position, light.direction, up);
    } else if (light.type === 2) {
        // Perspective projection for spot lights
        const fov = light.spotAngle;
        const aspect = 1.0; // Assuming square shadow map
        const nearPlane = 1.0;
        const farPlane = light.range;
        mat4.perspective(lightProjection, fov, aspect, nearPlane, farPlane);

        const lightPos = light.position;
        const lightDir = vec3.add(vec3.create(), light.position, light.direction);
        const up = [0.0, 1.0, 0.0];
        mat4.lookAt(lightView, lightPos, lightDir, up);
    }

    mat4.multiply(lightSpaceMatrix, lightProjection, lightView);
    return lightSpaceMatrix;
}

function computePointLightSpaceMatrix(light, faceIndex) {
    const lightPos = light.position;
    const nearPlane = 1.0;
    const farPlane = light.range;
    const shadowProjection = mat4.perspective(mat4.create(), Math.PI / 2, 1.0, nearPlane, farPlane);
    
    let shadowView = mat4.create();
    if (faceIndex === 0) {
        mat4.lookAt(shadowView, lightPos, vec3.add(vec3.create(), lightPos, [1.0, 0.0, 0.0]), [0.0, -1.0, 0.0]); // +X
    } else if (faceIndex === 1) {
        mat4.lookAt(shadowView, lightPos, vec3.add(vec3.create(), lightPos, [-1.0, 0.0, 0.0]), [0.0, -1.0, 0.0]); // -X
    } else if (faceIndex === 2) {
        mat4.lookAt(shadowView, lightPos, vec3.add(vec3.create(), lightPos, [0.0, 1.0, 0.0]), [0.0, 0.0, 1.0]); // +Y
    } else if (faceIndex === 3) {
        mat4.lookAt(shadowView, lightPos, vec3.add(vec3.create(), lightPos, [0.0, -1.0, 0.0]), [0.0, 0.0, -1.0]); // -Y
    } else if (faceIndex === 4) {
        mat4.lookAt(shadowView, lightPos, vec3.add(vec3.create(), lightPos, [0.0, 0.0, 1.0]), [0.0, -1.0, 0.0]); // +Z
    } else if (faceIndex === 5) {
        mat4.lookAt(shadowView, lightPos, vec3.add(vec3.create(), lightPos, [0.0, 0.0, -1.0]), [0.0, -1.0, 0.0]); // -Z
    }

    const lightSpaceMatrix = mat4.create();
    mat4.multiply(lightSpaceMatrix, shadowProjection, shadowView);
    return lightSpaceMatrix;
}
