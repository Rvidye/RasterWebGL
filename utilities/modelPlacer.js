"use strict"

class ModelPlacer {
    constructor() {
        this.position = vec3.create();
        this.rotation = vec3.create();
        this.scale = vec3.fromValues(1, 1, 1);
        this.multiplier = 1.0;
        this.mode = 'TRANSLATE';
        this.transformationMatrix = mat4.create();
    }

    updateTransformationMatrix() {
        mat4.identity(this.transformationMatrix);
        mat4.translate(this.transformationMatrix, this.transformationMatrix, this.position);
        mat4.rotateX(this.transformationMatrix, this.transformationMatrix, this.rotation[0]);
        mat4.rotateY(this.transformationMatrix, this.transformationMatrix, this.rotation[1]);
        mat4.rotateZ(this.transformationMatrix, this.transformationMatrix, this.rotation[2]);
        mat4.scale(this.transformationMatrix, this.transformationMatrix, this.scale);
    }

    applyTranslation(key) {
        switch (key) {
            case 'KeyI':
                this.position[2] -= this.multiplier;
                break;
            case 'KeyK':
                this.position[2] += this.multiplier;
                break;
            case 'KeyJ':
                this.position[0] -= this.multiplier;
                break;
            case 'KeyL':
                this.position[0] += this.multiplier;
                break;
            case 'KeyU':
                this.position[1] -= this.multiplier;
                break;
            case 'KeyO':
                this.position[1] += this.multiplier;
                break;
        }
        this.updateTransformationMatrix();
    }

    applyRotation(key) {
        switch (key) {
            case 'KeyI':
                this.rotation[2] -= this.multiplier;
                break;
            case 'KeyK':
                this.rotation[2] += this.multiplier;
                break;
            case 'KeyJ':
                this.rotation[0] -= this.multiplier;
                break;
            case 'KeyL':
                this.rotation[0] += this.multiplier;
                break;
            case 'KeyU':
                this.rotation[1] -= this.multiplier;
                break;
            case 'KeyO':
                this.rotation[1] += this.multiplier;
                break;
        }
        this.updateTransformationMatrix();
    }

    applyScale(key) {
        switch (key) {
            case 'KeyI':
                this.scale[0] += this.multiplier;
                this.scale[1] += this.multiplier;
                this.scale[2] += this.multiplier;
                break;
            case 'KeyK':
                this.scale[0] -= this.multiplier;
                this.scale[1] -= this.multiplier;
                this.scale[2] -= this.multiplier;
                break;
        }
        this.updateTransformationMatrix();
    }

    handleKeyboardInput(key) {
        switch (key) {
            case 'KeyB':
                this.mode = 'TRANSLATE';
                break;
            case 'KeyN':
                this.mode = 'ROTATE';
                break;
            case 'KeyM':
                this.mode = 'SCALE';
                break;
            case 'KeyI':
            case 'KeyK':
            case 'KeyJ':
            case 'KeyL':
            case 'KeyU':
            case 'KeyO':
                if (this.mode === 'TRANSLATE') {
                    this.applyTranslation(key);
                } else if (this.mode === 'ROTATE') {
                    this.applyRotation(key);
                } else if (this.mode === 'SCALE') {
                    this.applyScale(key);
                }
                break;
            case 'Comma':
                this.multiplier /= 10.0;
            break;
            case 'Period':
                this.multiplier *= 10.0;
            break;
            case 'Tab':
                console.log(this.generateTransformationCode());
            break;
        }
    }

    getTransformationMatrix() {
        mat4.identity(this.transformationMatrix);
        mat4.translate(this.transformationMatrix, this.transformationMatrix, this.position);
        mat4.rotateX(this.transformationMatrix, this.transformationMatrix, this.rotation[0]);
        mat4.rotateY(this.transformationMatrix, this.transformationMatrix, this.rotation[1]);
        mat4.rotateZ(this.transformationMatrix, this.transformationMatrix, this.rotation[2]);
        mat4.scale(this.transformationMatrix, this.transformationMatrix, this.scale);
        return this.transformationMatrix;
    }

    generateTransformationCode() {
        const position = `vec3.fromValues(${this.position[0].toFixed(5)}, ${this.position[1].toFixed(5)}, ${this.position[2].toFixed(5)})`;
        const rotation = `vec3.fromValues(${this.rotation[0].toFixed(5)}, ${this.rotation[1].toFixed(5)}, ${this.rotation[2].toFixed(5)})`;
        const scale = `vec3.fromValues(${this.scale[0].toFixed(5)}, ${this.scale[1].toFixed(5)}, ${this.scale[2].toFixed(5)})`;
        return `
        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, ${position});
        mat4.rotateX(transformationMatrix, transformationMatrix, ${this.rotation[0].toFixed(5)});
        mat4.rotateY(transformationMatrix, transformationMatrix, ${this.rotation[1].toFixed(5)});
        mat4.rotateZ(transformationMatrix, transformationMatrix, ${this.rotation[2].toFixed(5)});
        mat4.scale(transformationMatrix, transformationMatrix, ${scale});
        `;
    }

    renderUI(){
        ImGui.Text("Model Placer Controls:");
        // Radio buttons to select mode
        if (ImGui.RadioButton("TRANSLATE", this.mode === 'TRANSLATE')) {
            //this.handleModeChange('TRANSLATE');
            this.mode = 'TRANSLATE';
        }
        ImGui.SameLine();
        if (ImGui.RadioButton("ROTATE", this.mode === 'ROTATE')) {
            //this.handleModeChange('ROTATE');
            this.mode = 'ROTATE';
        }
        ImGui.SameLine();
        if (ImGui.RadioButton("SCALE", this.mode === 'SCALE')) {
            //this.handleModeChange('SCALE');
            this.mode = 'SCALE';
        }

        ImGui.Separator();
        let pos = [this.position[0],this.position[1],this.position[2],0.0];
        ImGui.Text("Translation:");
        if(ImGui.DragFloat3("Position", pos)){
            vec3.set(this.position,pos[0],pos[1],pos[2]);
        }
        ImGui.Separator();
        let rot = [this.rotation[0],this.rotation[1],this.rotation[2],0.0];
        ImGui.Text("Rotation:");
        if(ImGui.DragFloat3("Rotation", rot,0.1)){
            vec3.set(this.rotation,rot[0],rot[1],rot[2]);
        }
        ImGui.Separator();
        let scale = [this.scale[0],this.scale[1],this.scale[2],0.0];
        ImGui.Text("Scale:");
        if(ImGui.DragFloat3("Scaling", scale,0.1,1.0,100.0)){
            vec3.set(this.scale,scale[0],scale[1],scale[2]);
        }
        ImGui.Separator();
        ImGui.Text("Multiplier:");
        if (ImGui.Button("Increase (Period)")) {
          this.multiplier *= 10.0;
        }
        ImGui.SameLine();
        if (ImGui.Button("Decrease (Comma)")) {
          this.multiplier *= 0.1;
        }

        if (ImGui.Button("Print Transformation Matrix In Console")) {
            console.log(this.generateTransformationCode());
        }

        ImGui.Separator();
        ImGui.Text("To Move Selected Path Point");
        ImGui.Text("I/K = Z axis\nL/J = X axis\nO/U = Y axis");
        ImGui.Text("Multipler = " + this.multiplier);
        ImGui.Separator();
    }

}

