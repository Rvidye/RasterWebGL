"use strict"
class VideoTexture {
    constructor(gl, url) {
        this.gl = gl;
        this.video = null;
        this.texture = null;
        this.copyVideo = false;

        this.initVideo(url);
        this.initTexture();
    }

    initVideo(url) {
        this.video = document.createElement("video");
        this.video.playsInline = true;
        this.video.muted = true;
        this.video.loop = true;

        let playing = false;
        let timeupdate = false;

        this.video.addEventListener("playing", () => {
            playing = true;
            this.checkReady(playing, timeupdate);
        }, true);

        this.video.addEventListener("timeupdate", () => {
            timeupdate = true;
            this.checkReady(playing, timeupdate);
        }, true);

        this.video.src = url;
        this.video.play();
    }

    checkReady(playing, timeupdate) {
        if (playing && timeupdate) {
            this.copyVideo = true;
        }
    }

    initTexture() {
        const gl = this.gl;
        this.texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    updateTexture() {
        const gl = this.gl;
        if (this.copyVideo) {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
        }
    }

    getTexture() {
        return this.texture;
    }
}