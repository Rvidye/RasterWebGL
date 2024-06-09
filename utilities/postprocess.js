
function createFramebufferWithTexture(gl, width, height, internalFormat, format, type) {
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    //createTexture(gl, width, height, format, type = gl.UNSIGNED_BYTE, internalFormat = format)
    const texture = createTexture(gl, width, height, format, type, internalFormat);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error('Framebuffer is not complete');
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return { fbo, texture };
}

class PostProcessingEffect {
    constructor(gl, vertexShaderSrc, fragmentShaderSrc, width, height) {
        this.gl = gl;
        this.program = new ShaderProgram(gl,[vertexShaderSrc,fragmentShaderSrc]);
        this.fbo = createFramebufferWithTexture(gl, width, height, gl.RGBA16F, gl.RGBA, gl.FLOAT);
        this.width = width;
        this.height = height;
    }

    apply(inputTextures) {
        throw new Error('apply() must be implemented in the derived class');
    }
}

class PostProcessCompositor extends PostProcessingEffect{

    constructor(gl,vert,frag,width,height){
        super(gl,vert,frag,width,height);
    }

    apply(inputTextures){
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo.fbo);
        gl.viewport(0, 0, this.width, this.height);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.program.use();
        // Bind the input textures and set uniform values
        inputTextures.forEach((texture, index) => {
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(this.program.getUniformLocation(`uTexture${index}`), index);
        //console.log(`uTextures${index}`);
        });
        gl.uniform1i(this.program.getUniformLocation("uTextureCount"), inputTextures.length);
        // Draw a full-screen quad
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return this.fbo.texture;
    }
}

class ToneMap extends PostProcessingEffect{
    constructor(gl,vert,frag,width,height){
        super(gl,vert,frag,width,height);
    }

    apply(inputTexture){
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo.fbo);
        gl.clear(gl.COLOR_BUFFER_BIT);
        this.program.use();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inputTexture);
        gl.uniform1i(this.program.getUniformLocation("hdrTex"), 0);
        gl.uniform1f(this.program.getUniformLocation("exposure"), exposure);
        // Draw a full-screen quad
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        return this.fbo.texture;
    }
}

class Bloom extends PostProcessingEffect{

    constructor(gl,vert,frag,width,height){
        super(gl,vert,frag,width,height);
        this.upsample = new ShaderProgram(gl,[vert,"shaders/bloom/upsample.frag"]);
        this.mipChain = this.createMipChain(gl,width,height,6);
        gl.bindTexture(gl.TEXTURE_2D, this.fbo.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);

    }

    createMipChain(gl, width, height, mipChainLength) {
        const mipChain = [];
        let mipWidth = width;
        let mipHeight = height;
        for (let i = 0; i < mipChainLength; i++) {
            mipWidth = Math.max(1, mipWidth >> 1);
            mipHeight = Math.max(1, mipHeight >> 1);
            const texture = createTexture(gl, mipWidth, mipHeight, gl.RGBA, gl.FLOAT, gl.RGBA16F);
            mipChain.push({ texture, width: mipWidth, height: mipHeight });
        }
        return mipChain;
    }

    apply(inputTextures){

        // Generate mipmaps for the brightness texture
        gl.bindTexture(gl.TEXTURE_2D, inputTextures);
        gl.generateMipmap(gl.TEXTURE_2D);

        // Downsample
        this.program.use();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inputTextures);
        gl.uniform1i(this.program.getUniformLocation("srcTexture"), 0);
        for (let i = 0; i < this.mipChain.length; i++) {
            const mip = this.mipChain[i];
            const texelSize = [1.0 / mip.width, 1.0 / mip.height];
            gl.uniform2fv(this.program.getUniformLocation("srcResolution"), texelSize);
            gl.uniform1i(this.program.getUniformLocation("mipLevel"), i);

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo.fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, mip.texture, 0);
            gl.viewport(0, 0, mip.width, mip.height);
            gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        // Upsample
        this.upsample.use();
        gl.uniform1f(this.upsample.getUniformLocation("u_filterRadius"), 0.005);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.blendEquation(gl.FUNC_ADD);

        for (let i = this.mipChain.length - 1; i > 0; i--) {
            const mip = this.mipChain[i];
            const nextMip = this.mipChain[i - 1];

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, mip.texture);
            gl.uniform1i(this.upsample.getUniformLocation("srcTexture"), 0);

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo.fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, nextMip.texture, 0);
            gl.viewport(0, 0, nextMip.width, nextMip.height);
            gl.clearBufferfv(gl.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        gl.disable(gl.BLEND);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.width, this.height);
        return this.mipChain[0].texture;
    }
}
