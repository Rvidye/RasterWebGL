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
        const position = `vec3.fromValues(${this.position[0].toFixed(2)}, ${this.position[1].toFixed(2)}, ${this.position[2].toFixed(2)})`;
        const rotation = `vec3.fromValues(${this.rotation[0].toFixed(2)}, ${this.rotation[1].toFixed(2)}, ${this.rotation[2].toFixed(2)})`;
        const scale = `vec3.fromValues(${this.scale[0].toFixed(2)}, ${this.scale[1].toFixed(2)}, ${this.scale[2].toFixed(2)})`;
        return `
        mat4.identity(transformationMatrix);
        mat4.translate(transformationMatrix, transformationMatrix, ${position});
        mat4.rotateX(transformationMatrix, transformationMatrix, ${this.rotation[0].toFixed(2)});
        mat4.rotateY(transformationMatrix, transformationMatrix, ${this.rotation[1].toFixed(2)});
        mat4.rotateZ(transformationMatrix, transformationMatrix, ${this.rotation[2].toFixed(2)});
        mat4.scale(transformationMatrix, transformationMatrix, ${scale});
        `;
    }
}

