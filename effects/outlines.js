class Outline extends PostProcessingEffect {
    constructor(gl, vert, frag, width, height) {
        super(gl, vert, frag, width, height);
    }

    apply(colorTexture,normalTexture,depthTexture) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo.fbo);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.program.use();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, colorTexture);
        gl.uniform1i(this.program.getUniformLocation(`colorTexture`), 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, normalTexture);
        gl.uniform1i(this.program.getUniformLocation(`normalTexture`), 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.uniform1i(this.program.getUniformLocation(`depthTexture`), 2);
        gl.uniform1f(this.program.getUniformLocation("cameraNear"), 1.0);
        gl.uniform1f(this.program.getUniformLocation("cameraFar"), 1000.0);
        gl.uniform4fv(this.program.getUniformLocation("screenSize"),[2048,2048,1/2048,1/2048]);
        gl.uniform4fv(this.program.getUniformLocation("multiplierParameters"),[5.0,20.0,1.0,1.0]);
        gl.uniform3fv(this.program.getUniformLocation("outlineColor"),[0.5,0.5,0.5]);
        gl.uniform1i(this.program.getUniformLocation(`debugVisualize`), 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return this.fbo.texture;
    }
}