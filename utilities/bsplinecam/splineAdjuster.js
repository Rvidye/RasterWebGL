"use strict";

class SplineAdjuster {
    constructor(bspline) {
        assert(
            undefined !== bspline || null !== bspline,
            "Null Pointer to Constructor"
        );
        this.bspline = bspline;
        this.isRenderPath = true;
        this.isRenderPathPoints = true;
        this.scalingFactor = 1.0;
        this.selectedPathPoint = 0;

        this.program = new ShaderProgram(gl, ["shaders/utilities/lightsrc.vert", "shaders/utilities/lightsrc.frag"]);
        this.pathRenderer = new SplineRenderer(this.program, bspline);
    }

    render() {
        if (this.isRenderPath) {
            this.pathRenderer.render([1.0, 1.0, 1.0], [0.0, 1.0, 0.0], [1.0, 1.0, 0.0], this.selectedPathPoint, this.scalingFactor);
        }
    }

    updateT(speed) {
    }

    resetT() {
    }

    setRenderPath(setting) {
        this.isRenderPath = setting;
    }

    setRenderPathPoints(setting) {
        this.isRenderPathPoints = setting;
        this.pathRenderer.setRenderPoints(setting);
    }

    setScalingFactor(scalingFactor) {
        this.scalingFactor = scalingFactor;
    }

    print() {
        console.log("Position: {");
        for (let pos of this.bspline.getPoints()) {
            console.log(`\t${pos},`);
        }
        console.log("}");
    }

    renderUI() {
        ImGui.Text("Spline Adjuster Controls");
        // Render settings
        ImGui.Checkbox("Render Path", (value = this.isRenderPath) => this.isRenderPath = value);

        // Scaling factor
        ImGui.SliderFloat("Scaling Factor", (value = this.scalingFactor) => this.scalingFactor = value, 0.1, 10.0);

        // // Selected Path Point
        ImGui.Text(`Selected Path Point: ${this.selectedPathPoint}`);
        if (ImGui.Button("Previous Path Point")) {
            this.selectedPathPoint = (this.selectedPathPoint === 0) ? this.bspline.getPoints().length - 1 : (this.selectedPathPoint - 1) % this.bspline.getPoints().length;
        }
        ImGui.SameLine();
        if (ImGui.Button("Next Path Point")) {
            this.selectedPathPoint = (this.selectedPathPoint + 1) % this.bspline.getPoints().length;
        }
        if (ImGui.Button("Print Path Info")) {
            this.print();
        }
        ImGui.Separator();
        ImGui.Text("To Move Selected Path Point");
        ImGui.Text("I/K = Z path point\nL/J = X path point\nO/U = Y path point");
        ImGui.Text("To Move Selected Front Point");
        ImGui.Text("T/G = Z front point\nH/F = X front point\nY/R = Y front point");
        ImGui.Separator();
    }

    keyboardFunc(key) {
        let refreshPos = false;
        let speed = 1.0;
        switch (key) {
            case 'ArrowLeft':
                break;
            case 'ArrowRight':
                break;
            case 'KeyI':
                this.bspline.getPoints()[this.selectedPathPoint][2] += speed;
                refreshPos = true;
                break;
            case 'KeyK':
                this.bspline.getPoints()[this.selectedPathPoint][2] -= speed;
                refreshPos = true;
                break;
            case 'KeyL':
                this.bspline.getPoints()[this.selectedPathPoint][0] += speed;
                refreshPos = true;
                break;
            case 'KeyJ':
                this.bspline.getPoints()[this.selectedPathPoint][0] -= speed;
                refreshPos = true;
                break;
            case 'KeyO':
                this.bspline.getPoints()[this.selectedPathPoint][1] += speed;
                refreshPos = true;
                break;
            case 'KeyU':
                this.bspline.getPoints()[this.selectedPathPoint][1] -= speed;
                refreshPos = true;
                break;
            case 'BracketRight':
                if (this.selectedPathPoint === this.bspline.getPoints().length) {
                    this.bspline.getPoints().push(this.bspline.getPoints()[this.selectedPathPoint]);
                } else {
                    this.bspline.getPoints().splice(this.selectedPathPoint + 1, 0, this.bspline.getPoints()[this.selectedPathPoint]);
                }
                refreshPos = true;
                break;
            case 'BracketLeft':
                this.bspline.getPoints().splice(this.selectedPathPoint, 1);
                this.selectedPathPoint = this.selectedPathPoint % this.bspline.getPoints().length;
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
                this.print();
                break;
        }

        if (refreshPos) {
            this.bspline.updatePoints(this.bspline.getPoints());
            this.bspline.recalculateSpline();
            this.pathRenderer = new SplineRenderer(this.program, this.bspline);
            //this.pathRenderer.updateGeometry();
            this.pathRenderer.setRenderPoints(this.isRenderPathPoints);
        }
    }
}
