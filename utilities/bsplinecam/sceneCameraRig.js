"use strict";

class SceneCameraRig {
    constructor(sceneCamera) {
        assert(
            undefined !== sceneCamera || null !== sceneCamera,
            "Null Pointer to Constructor"
        );

        this.isRenderPath = false;
        this.isRenderFront = false;
        this.isRenderPathToFront = false;
        this.isRenderPathPoints = false;
        this.isRenderFrontPoints = false;
        this.scalingFactor = 1.0;
        this.selectedPathPoint = 0;
        this.selectedFrontPoint = 0;

        this.program = new ShaderProgram(gl, ["shaders/utilities/lightsrc.vert", "shaders/utilities/lightsrc.frag"]);
        this.vaoPoint = gl.createVertexArray();
        this.vboPoint = gl.createBuffer();
        this.vaoPathToFront = gl.createVertexArray();
        this.vboPathToFront = gl.createBuffer();

        this.mountCamera = sceneCamera;
        this.pathRenderer = new SplineRenderer(this.program,this.mountCamera.m_bspPositions);
        this.frontRenderer = new SplineRenderer(this.program,this.mountCamera.m_bspFront);
    }

    loadGeometry() {
        const verts = new Float32Array([
            1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
            1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
            1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0,
            1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
            -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,
            1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0,
            1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0,
            1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0
        ]);

        gl.bindVertexArray(this.vaoPoint);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboPoint);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        gl.bindVertexArray(this.vaoPathToFront);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboPathToFront);
        gl.bufferData(gl.ARRAY_BUFFER, 3 * 2 * 4, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);
    }

    render() {
        if (this.isRenderPath) {
            this.pathRenderer.render([1.0, 1.0, 1.0], [0.0, 1.0, 0.0], [1.0, 1.0, 0.0], this.selectedPathPoint, this.scalingFactor);
        }
        if (this.isRenderFront) {
            this.frontRenderer.render([1.0, 1.0, 1.0], [0.0, 0.0, 1.0], [0.0, 1.0, 1.0], this.selectedFrontPoint, this.scalingFactor);
        }

        if (this.isRenderPathToFront) {
            const pointFront = [
                this.mountCamera.m_bspPositions.interpolateSpline(this.mountCamera.t),
                this.mountCamera.m_bspFront.interpolateSpline(this.mountCamera.t)
            ];

            this.program.use();
            gl.uniformMatrix4fv(this.program.getUniformLocation("pMat"),false, currentCamera.getProjectionMatrix());
            gl.uniformMatrix4fv(this.program.getUniformLocation("vMat"),false, currentCamera.getViewMatrix());
            gl.uniformMatrix4fv(this.program.getUniformLocation("mMat"), false, mat4.create());
            gl.uniformMatrix4fv(this.program.getUniformLocation("nMat"), false, mat4.create());
            gl.uniform3fv(this.program.getUniformLocation("lightcolor"), [1.0, 0.0, 0.0]);

            gl.bindVertexArray(this.vaoPathToFront);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vboPathToFront);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([pointFront[0][0], pointFront[0][1], pointFront[0][2], pointFront[1][0], pointFront[1][1], pointFront[1][2]]), gl.DYNAMIC_DRAW);
            gl.drawArrays(gl.LINES, 0, 2);

            gl.bindVertexArray(this.vaoPoint);
            let modelViewMatrix = mat4.create();
            mat4.translate(modelViewMatrix, modelViewMatrix, pointFront[0]);
            mat4.scale(modelViewMatrix, modelViewMatrix, [this.scalingFactor, this.scalingFactor, this.scalingFactor]);
            gl.uniformMatrix4fv(this.program.getUniformLocation("mMat"), false, modelViewMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
            modelViewMatrix = mat4.create();
            mat4.translate(modelViewMatrix, modelViewMatrix, pointFront[1]);
            mat4.scale(modelViewMatrix, modelViewMatrix, [this.scalingFactor, this.scalingFactor, this.scalingFactor]);
            gl.uniformMatrix4fv(this.program.getUniformLocation("mMat"), false, modelViewMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 36);
        }
    }

    updateT(speed) {
        this.mountCamera.setT(Math.min(this.mountCamera.getT() + speed, 1.0));
    }

    resetT() {
        this.mountCamera.setT(0.0);
    }

    setRenderPath(setting) {
        this.isRenderPath = setting;
    }

    setRenderPathPoints(setting) {
        this.isRenderPathPoints = setting;
        this.pathRenderer.setRenderPoints(setting);
    }

    setRenderFront(setting) {
        this.isRenderFront = setting;
    }

    setRenderFrontPoints(setting) {
        this.isRenderFrontPoints = setting;
        this.frontRenderer.setRenderPoints(setting);
    }

    setRenderPathToFront(setting) {
        this.isRenderPathToFront = setting;
    }

    setScalingFactor(scalingFactor) {
        this.scalingFactor = scalingFactor;
    }

    getCamera() {
        return this.mountCamera;
    }

    renderUI(){
        ImGui.Text("Scene Camera Rig Controls");
        // Render settings
        ImGui.Checkbox("Render Path", (value = this.isRenderPath) => this.isRenderPath = value);
        ImGui.Checkbox("Render Front", (value = this.isRenderFront) => this.isRenderFront = value);
        ImGui.Checkbox("Render Path to Front", (value = this.isRenderPathToFront) => this.isRenderPathToFront = value);
        // if(ImGui.Checkbox("Render Path Points", (value = this.isRenderPathPoints) => this.isRenderPathPoints = value)){
        //     //this.pathRenderer.setRenderPoints(setting);
        // }
        // if(ImGui.Checkbox("Render Front Points", (value = this.isRenderFrontPoints) => this.isRenderFrontPoints = value)){
        //     //this.frontRenderer.setRenderPoints(setting);
        // }

        // Scaling factor
        ImGui.SliderFloat("Scaling Factor", (value = this.scalingFactor) => this.scalingFactor = value, 0.1, 10.0);

        // // Selected Path Point
        ImGui.Text(`Selected Path Point: ${this.selectedPathPoint}`);
        if (ImGui.Button("Previous Path Point")) {
            this.selectedPathPoint = (this.selectedPathPoint === 0) ? this.mountCamera.m_bspPositions.getPoints().length - 1 : (this.selectedPathPoint - 1) % this.mountCamera.m_bspPositions.getPoints().length;
        }
        ImGui.SameLine();
        if (ImGui.Button("Next Path Point")) {
            this.selectedPathPoint = (this.selectedPathPoint + 1) % this.mountCamera.m_bspPositions.getPoints().length;
        }

        // // Selected Front Point
        ImGui.Text(`Selected Front Point: ${this.selectedFrontPoint}`);
        if (ImGui.Button("Previous Front Point")) {
            this.selectedFrontPoint = (this.selectedFrontPoint === 0) ? this.mountCamera.m_bspFront.getPoints().length - 1 : (this.selectedFrontPoint - 1) % this.mountCamera.m_bspFront.getPoints().length;
        }
        ImGui.SameLine();
        if (ImGui.Button("Next Front Point")) {
            this.selectedFrontPoint = (this.selectedFrontPoint + 1) % this.mountCamera.m_bspFront.getPoints().length;
        }
        if (ImGui.Button("Print Camera Info")) {
            this.mountCamera.printVectors();
        }
        ImGui.Separator();
        ImGui.Text("To Move Selected Path Point");
        ImGui.Text("I/K = Z path point\nL/J = X path point\nO/U = Y path point");
        ImGui.Text("To Move Selected Front Point");
        ImGui.Text("T/G = Z front point\nH/F = X front point\nY/R = Y front point");
        ImGui.Separator();
        // // Point adjustments
        // ImGui.Text("Adjust Selected Path Point");
        // if (ImGui.Button("Move +X")) {
        //     this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][0] += 0.1;
        //     this.updatePathPoints();
        // }
        // ImGui.SameLine();
        // if (ImGui.Button("Move -X")) {
        //     this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][0] -= 0.1;
        //     this.updatePathPoints();
        // }
        // if (ImGui.Button("Move +Y")) {
        //     this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][1] += 0.1;
        //     this.updatePathPoints();
        // }
        // ImGui.SameLine();
        // if (ImGui.Button("Move -Y")) {
        //     this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][1] -= 0.1;
        //     this.updatePathPoints();
        // }
        // if (ImGui.Button("Move +Z")) {
        //     this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][2] += 0.1;
        //     this.updatePathPoints();
        // }
        // ImGui.SameLine();
        // if (ImGui.Button("Move -Z")) {
        //     this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][2] -= 0.1;
        //     this.updatePathPoints();
        // }

        // ImGui.Text("Adjust Selected Front Point");
        // if (ImGui.Button("Move +X")) {
        //     this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][0] += 0.1;
        //     this.updateFrontPoints();
        // }
        // ImGui.SameLine();
        // if (ImGui.Button("Move -X")) {
        //     this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][0] -= 0.1;
        //     this.updateFrontPoints();
        // }
        // if (ImGui.Button("Move +Y")) {
        //     this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][1] += 0.1;
        //     this.updateFrontPoints();
        // }
        // ImGui.SameLine();
        // if (ImGui.Button("Move -Y")) {
        //     this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][1] -= 0.1;
        //     this.updateFrontPoints();
        // }
        // if (ImGui.Button("Move +Z")) {
        //     this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][2] += 0.1;
        //     this.updateFrontPoints();
        // }
        // ImGui.SameLine();
        // if (ImGui.Button("Move -Z")) {
        //     this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][2] -= 0.1;
        //     this.updateFrontPoints();
        // }
    }

    keyboardFunc(key) {
        let refreshPos = false;
        let refreshFront = false;
        switch (key) {
            case 'ArrowLeft':
                this.mountCamera.updateT(-0.01);
                break;
            case 'ArrowRight':
                this.mountCamera.updateT(0.01);
                break;
            // case 'KeyV':
            //     this.selectedFrontPoint = (this.selectedFrontPoint === 0) ? this.mountCamera.m_bspFront.getPoints().length - 1 : (this.selectedFrontPoint - 1) % this.mountCamera.m_bspFront.getPoints().length;
            //     break;
            // case 'KeyB':
            //     this.selectedFrontPoint = (this.selectedFrontPoint + 1) % this.mountCamera.m_bspFront.getPoints().length;
            //     break;
            // case 'KeyN':
            //     this.selectedPathPoint = (this.selectedPathPoint === 0) ? this.mountCamera.m_bspPositions.getPoints().length - 1 : (this.selectedPathPoint - 1) % this.mountCamera.m_bspPositions.getPoints().length;
            //     break;
            // case 'KeyM':
            //     this.selectedPathPoint = (this.selectedPathPoint + 1) % this.mountCamera.m_bspPositions.getPoints().length;
            //     break;
            case 'KeyT':
                this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][2] += 0.1;
                refreshFront = true;
                break;
            case 'KeyG':
                this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][2] -= 0.1;
                refreshFront = true;
                break;
            case 'KeyH':
                this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][0] += 0.1;
                refreshFront = true;
                break;
            case 'KeyF':
                this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][0] -= 0.1;
                refreshFront = true;
                break;
            case 'KeyY':
                this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][1] += 0.1;
                refreshFront = true;
                break;
            case 'KeyR':
                this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint][1] -= 0.1;
                refreshFront = true;
                break;
            case 'KeyI':
                this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][2] += 0.1;
                refreshPos = true;
                break;
            case 'KeyK':
                this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][2] -= 0.1;
                refreshPos = true;
                break;
            case 'KeyL':
                this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][0] += 0.1;
                refreshPos = true;
                break;
            case 'KeyJ':
                this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][0] -= 0.1;
                refreshPos = true;
                break;
            case 'KeyO':
                this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][1] += 0.1;
                refreshPos = true;
                break;
            case 'KeyU':
                this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint][1] -= 0.1;
                refreshPos = true;
                break;
            case 'BracketRight':
                if (this.selectedPathPoint === this.mountCamera.m_bspPositions.getPoints().length) {
                    this.mountCamera.m_bspPositions.getPoints().push(this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint]);
                } else {
                    this.mountCamera.m_bspPositions.getPoints().splice(this.selectedPathPoint + 1, 0, this.mountCamera.m_bspPositions.getPoints()[this.selectedPathPoint]);
                }
                refreshPos = true;
                break;
            case 'BracketLeft':
                this.mountCamera.m_bspPositions.getPoints().splice(this.selectedPathPoint, 1);
                this.selectedPathPoint = this.selectedPathPoint % this.mountCamera.m_bspPositions.getPoints().length;
                refreshPos = true;
                break;
            case 'Period':
                if (this.selectedFrontPoint === this.mountCamera.m_bspFront.getPoints().length) {
                    this.mountCamera.m_bspFront.getPoints().push(this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint]);
                } else {
                    this.mountCamera.m_bspFront.getPoints().splice(this.selectedFrontPoint + 1, 0, this.mountCamera.m_bspFront.getPoints()[this.selectedFrontPoint]);
                }
                refreshFront = true;
                break;
            case 'Comma':
                this.mountCamera.m_bspFront.getPoints().splice(this.selectedFrontPoint, 1);
                this.selectedFrontPoint = this.selectedFrontPoint % this.mountCamera.m_bspFront.getPoints().length;
                refreshFront = true;
                break;
            case 'Tab':
                this.mountCamera.printVectors();
            break;
        }

        if (refreshPos) {
            this.mountCamera.m_bspPositions.updatePoints(this.mountCamera.m_bspPositions.getPoints());
            this.mountCamera.m_bspPositions.recalculateSpline();
            this.pathRenderer = new SplineRenderer(this.program,this.mountCamera.m_bspPositions);
            //this.pathRenderer.updateGeometry();
            this.pathRenderer.setRenderPoints(this.isRenderPathPoints);
        }
        if (refreshFront) {
            this.mountCamera.m_bspFront.updatePoints(this.mountCamera.m_bspFront.getPoints());
            this.mountCamera.m_bspFront.recalculateSpline();
            this.frontRenderer = new SplineRenderer(this.program,this.mountCamera.m_bspFront);
            //this.pathRenderer.updateGeometry();
            this.frontRenderer.setRenderPoints(this.isRenderFrontPoints);
        }
    }
}


