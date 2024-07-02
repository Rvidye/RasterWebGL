
class atmScattering {

    constructor() {
        this.atmScatteringProgramObject = null;
        this.sphere = null;
        this.e_I_sun = 20.0;
        this.e_R_e = 6360.0;
        this.e_R_a = 6420.0;
        this.e_beta_R = [0.0058, 0.0135, 0.0331];
        this.e_beta_M = 0.0210;
        this.e_H_R = 7.994;
        this.e_H_M = 1.200;
        this.e_g = 0.888;
        this.defViewSamples = 16;
        this.defLightSamples = 8;
        var tmpCam = new DebugCamera();
        tmpCam.position = vec3.fromValues(0.0, 0.0, 0.0);
		tmpCam.cameraYaw = 270.0;
		tmpCam.cameraPitch = 20.0;
        this.localViewMat = tmpCam.getViewMatrix();
    }

    setupProgram() {
        this.atmScatteringProgramObject = new ShaderProgram(gl, ['shaders/atmosphericScattering/atmosphere.vert', 'shaders/atmosphericScattering/atmosphere.frag']);
        this.sphere = setupModel("sphere", false);
    }

    initAtmScattering() {
        this.setupProgram();
    }

    // sunangle -90 degrees : sunrise, 0 degrees : sun overhead, 90 degrees : sunset
    renderAtmScattering(model,sunAngle) {
        var modelAtmos = mat4.create();
        mat4.translate(modelAtmos, modelAtmos, [0.0, -6354.0 + currentCamera.position[1], 0.0]);
        mat4.rotate(modelAtmos, modelAtmos, -134.0 * Math.PI / 180, [0.0, 1.0, 0.0]);
        mat4.scale(modelAtmos, modelAtmos, [this.e_R_a, this.e_R_a, this.e_R_a]);

        var view = mat4.create();
        var mvMat = mat4.create();
        mat4.multiply(mvMat,currentCamera.getViewMatrix(),modelAtmos);
        mat4.multiply(view,this.localViewMat,mvMat);
        this.atmScatteringProgramObject.use();
        gl.uniformMatrix4fv(this.atmScatteringProgramObject.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(this.atmScatteringProgramObject.getUniformLocation("vMat"), false, view);
        gl.uniformMatrix4fv(this.atmScatteringProgramObject.getUniformLocation("mMat"), false, modelAtmos);
        gl.uniformMatrix4fv(this.atmScatteringProgramObject.getUniformLocation("M"), false, mat4.scale(mat4.create(), mat4.create(), [this.e_R_a, this.e_R_a, this.e_R_a]));
        gl.uniform3fv(this.atmScatteringProgramObject.getUniformLocation("viewPos"), [0.0, this.e_R_e, 30.0]);
        gl.uniform3fv(this.atmScatteringProgramObject.getUniformLocation("sunPos"), [0.0, Math.sin(sunAngle), -Math.cos(sunAngle)]);
        gl.uniform1i(this.atmScatteringProgramObject.getUniformLocation("viewSamples"), this.defViewSamples);
        gl.uniform1i(this.atmScatteringProgramObject.getUniformLocation("lightSamples"), this.defLightSamples);
        gl.uniform1f(this.atmScatteringProgramObject.getUniformLocation("I_sun"), this.e_I_sun);
        gl.uniform1f(this.atmScatteringProgramObject.getUniformLocation("R_e"), this.e_R_e);
        gl.uniform1f(this.atmScatteringProgramObject.getUniformLocation("R_a"), this.e_R_a);
        gl.uniform3fv(this.atmScatteringProgramObject.getUniformLocation("beta_R"), this.e_beta_R);
        gl.uniform1f(this.atmScatteringProgramObject.getUniformLocation("beta_M"), this.e_beta_M);
        gl.uniform1f(this.atmScatteringProgramObject.getUniformLocation("H_R"), this.e_H_R);
        gl.uniform1f(this.atmScatteringProgramObject.getUniformLocation("H_M"), this.e_H_M);
        gl.uniform1f(this.atmScatteringProgramObject.getUniformLocation("g"), this.e_g);
        renderModel(this.sphere, this.atmScatteringProgramObject, false, false);
    }

    updateAtmScattering() {
    }

    uninitAtmScaterring() {
        this.atmScatteringProgramObject = null;
        this.sphere = null;
    }
}

