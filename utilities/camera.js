"use strict"

class camera {

    constructor(
        position = vec3.fromValues(0.0, 0.0, 5.0),
        front = vec3.fromValues(0.0, 0.0, -1.0),
        up = vec3.fromValues(0.0, 1.0, 0.0)
    ) {
        this.position = position;
        this.front = front;
        this.up = up;
        this.view = mat4.create();
        this.projection = mat4.create();
        this.width = 1920;
        this.height = 1080;
    }

    setProjectionMatrix(projMat) {
        this.projection = projMat;
    }

    getProjectionMatrix() {
        mat4.perspective(this.projection, Math.PI / 4, this.width / this.height, 0.1, 1000.0);
        return this.projection;
    }

    getViewMatrix() {
        mat4.lookAt(this.view, this.position, this.front, this.up);
        return this.view;
    }

    getPosition() {
        return this.position;
    }

    getFront() {
        return this.front;
    }

    resizeCamera(width, height) {
        this.width = width;
        this.height = height;
    }

    keyboard(event) { }
    mouseMove(event) { }
    mouseDown(event) { }
    mouseUp(event) { }
};

class DebugCamera extends camera {
    constructor(position, front, up) {
        super(position, front, up);
        this.speed = 5.3;

        this.cameraYaw = -90.0;
        this.cameraPitch = 0.0;
        this.lastmousex = -1;
        this.lastmousey = -1;
    }

    keyboard(event) {
        switch (event.code) {
            case 'KeyD':
                var dir = vec3.create();
                vec3.cross(dir, this.front, this.up);
                vec3.normalize(dir, dir);
                vec3.multiply(dir, dir, [this.speed, this.speed, this.speed]);
                vec3.add(this.position, this.position, dir);
                break;
            case 'KeyA':
                var dir = vec3.create();
                vec3.cross(dir, this.front, this.up);
                vec3.normalize(dir, dir);
                vec3.multiply(dir, dir, [this.speed, this.speed, this.speed]);
                vec3.subtract(this.position, this.position, dir);
                break;
            case 'KeyW':
                var dir = vec3.create();
                vec3.multiply(dir, this.front, [this.speed, this.speed, this.speed]);
                vec3.add(this.position, this.position, dir);
                break;
            case 'KeyS':
                var dir = vec3.create();
                vec3.multiply(dir, this.front, [this.speed, this.speed, this.speed]);
                vec3.subtract(this.position, this.position, dir);
                break;
        }
    }

    getViewMatrix() {
        mat4.identity(this.view);
        var newfront = vec3.create();
        vec3.add(newfront, this.front, this.position);
        // mat4.translate(this.view, this.view, [this.px, this.py, this.pz]);
        // mat4.rotateX(this.view, this.view, toRadian(this.elev));
        // mat4.rotateY(this.view, this.view, toRadian(-this.ang));
        // mat4.rotateZ(this.view, this.view, toRadian(this.roll));
        //mat4.invert(this.view, this.view); // Inverse to create a proper view matrix
        mat4.lookAt(this.view, this.position, newfront, this.up);
        return this.view;
    }

    mouseDown(event) {
        this.lastmousex = event.x;
        this.lastmousey = event.y;
    }

    mouseMove(event) {
        if (this.lastmousex != -1 && this.lastmousey != -1) {
            var xoffset = event.x - this.lastmousex;
            var yoffset = this.lastmousey - event.y;
            this.lastmousex = event.x;
            this.lastmousey = event.y;
            var sensitivity = 0.1;
            xoffset *= sensitivity;
            yoffset *= sensitivity;
            this.cameraYaw += xoffset;
            this.cameraPitch += yoffset;

            if (this.cameraPitch > 89.0) {
                this.cameraPitch = 89.0;
            } else if (this.cameraPitch < -89.0) {
                this.cameraPitch = -89.0;
            }
            var direction = [Math.cos(glMatrix.glMatrix.toRadian(this.cameraYaw)) * Math.cos(glMatrix.glMatrix.toRadian(this.cameraPitch)), Math.sin(glMatrix.glMatrix.toRadian(this.cameraPitch)), Math.sin(glMatrix.glMatrix.toRadian(this.cameraYaw)) * Math.cos(glMatrix.glMatrix.toRadian(this.cameraPitch))];
            vec3.normalize(this.front, direction);
        }
    }

    mouseUp(event) {
        this.lastmousex = -1;
        this.lastmousey = -1;
    }
};