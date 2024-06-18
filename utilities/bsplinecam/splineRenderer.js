"use strict";

class SplineRenderer{
    constructor(program,interpolator, linspace = 0.01) {
        this.m_interpolator = interpolator;
        this.m_nAllPositions = 0;
        this.m_linspace = linspace;
        this.m_isRenderPoints = true;
        this.m_points = interpolator.getPoints();

        // Initialize WebGL buffers and shaders
        this.m_vaoSpline = gl.createVertexArray();
        this.m_vboSpline = gl.createBuffer();
        this.m_vaoPoint = gl.createVertexArray();
        this.m_vboPoint = gl.createBuffer();
        this.program = program;

        // Load geometry into the pipeline
        this.loadGeometry();
    }

    loadGeometry() {
        // Interpolate through the entire spline and load into the pipeline
        const allPositions = [];
        for (let t = 0.0; t <= 1.0; t += this.m_linspace) {
            const value = this.m_interpolator.interpolateSpline(t);
            allPositions.push(value[0], value[1], value[2]);
            this.m_nAllPositions++;
        }

        gl.bindVertexArray(this.m_vaoSpline);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_vboSpline);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allPositions), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        // Define vertices for a cube to mark points
        const verts = new Float32Array([
            0.0, 1.0, 0.0, -1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0,
            0.0, 1.0, 0.0, 1.0, 0.0, -1.0, -1.0, 0.0, -1.0,
            0.0, 1.0, 0.0, -1.0, 0.0, -1.0, -1.0, 0.0, 1.0,
            0.0, -1.0, 0.0, 1.0, 0.0, 1.0, -1.0, 0.0, 1.0,
            0.0, -1.0, 0.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0,
            0.0, -1.0, 0.0, -1.0, 0.0, -1.0, 1.0, 0.0, -1.0,
            0.0, -1.0, 0.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0
        ]);

        gl.bindVertexArray(this.m_vaoPoint);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_vboPoint);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
    }

    updateGeometry() {
        const allPositions = [];
        for (let t = 0.0; t <= 1.0; t += this.m_linspace) {
            const value = this.m_interpolator.interpolateSpline(t);
            allPositions.push(value[0], value[1], value[2]);
            this.m_nAllPositions++;
        }

        gl.bindVertexArray(this.m_vaoSpline);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.m_vboSpline);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allPositions), gl.STATIC_DRAW);
    }

    render(lineColor, pointColor, selectedPointColor, selected, scale) {

        this.program.use();
        gl.uniformMatrix4fv(this.program.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(this.program.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());
        gl.uniformMatrix4fv(this.program.getUniformLocation("mMat"), false, mat4.create());
        gl.uniformMatrix4fv(this.program.getUniformLocation("nMat"), false, mat4.create());
        gl.uniform3fv(this.program.getUniformLocation("lightcolor"), lineColor);
        gl.bindVertexArray(this.m_vaoSpline);
        gl.drawArrays(gl.LINE_STRIP, 0, this.m_nAllPositions);

        if (this.m_isRenderPoints) {
            gl.bindVertexArray(this.m_vaoPoint);
            for (let i = 0; i < this.m_points.length; i++) {
                const color = (i === selected) ? selectedPointColor : pointColor;
                gl.uniform3fv(this.program.getUniformLocation("lightcolor"), color);

                const pointMvpMatrix = mat4.create();
                mat4.translate(pointMvpMatrix, pointMvpMatrix, this.m_points[i]);
                mat4.scale(pointMvpMatrix, pointMvpMatrix, [scale, scale, scale]);
                gl.uniformMatrix4fv(this.program.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
                gl.uniformMatrix4fv(this.program.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());
                gl.uniformMatrix4fv(this.program.getUniformLocation("mMat"), false, pointMvpMatrix);
                gl.uniformMatrix4fv(this.program.getUniformLocation("nMat"), false, mat4.create());
                gl.drawArrays(gl.TRIANGLES, 0, 24);
            }
        }
    }

    setRenderPoints(setting) {
        this.m_isRenderPoints = setting;
    }
}

