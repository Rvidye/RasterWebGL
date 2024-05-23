"use strict"

class camera{

    constructor(
        position = vec3.fromValues(0.0,0.0,5.0),
        front = vec3.fromValues(0.0,0.0,-1.0),
        up = vec3.fromValues(0.0,1.0,0.0)
        )
    {
        this.position = position;
        this.front = front;
        this.up = up;
        this.view = mat4.create();
        this.projection = mat4.create();
        this.width = 1920;
        this.height = 1080;
    }

    setProjectionMatrix(projMat)
    {
        this.projection = projMat;
    }

    getProjectionMatrix()
    {
        mat4.perspective(this.projection,Math.PI/4,this.width / this.height,0.1,1000.0);
        return this.projection;
    }

    getViewMatrix()
    {
        mat4.lookAt(this.view,this.position,this.front,this.up);
        return this.view;
    }

    getPosition()
    {
        return this.position;
    }

    getFront()
    {
        return this.front;
    }

    resizeCamera(width, height)
    {
        this.width = width;
        this.height = height;
    }

    keyboard(event){}
    mouseMove(event){}
    mouseDown(event){}
    mouseUp(event){}
};

class DebugCamera extends camera
{
    constructor(position,front,up)
    {
        super(position,front,up);
        
        this.px = this.position[0];
        this.py = this.position[1];
        this.pz = this.position[2];

        this.ang = 0.0; //YAW
        this.elev = 0.0; // Pitch
        this.roll = 0.0; // Roll

        this.turnSpeed = 90;
        this.speed = 5.0;
    }

    keyboard(event)
    {
        switch(event.code)
        {
            case 'KeyW':
            case 'KeyS':
                var direction = (event.code === 'KeyW') ? 1 : -1;
                this.px -= Math.sin(toRadian(this.ang)) * GLOBAL.deltaTime * this.speed * direction;
                this.py -= Math.sin(toRadian(this.elev)) * GLOBAL.deltaTime * this.speed * direction;
                this.pz -= Math.cos(toRadian(this.ang)) * GLOBAL.deltaTime * this.speed * direction;
            break;
            case 'KeyA':
            case 'KeyD':
                var direction = (event.code === 'KeyA') ? -1 : 1;
                this.ang += GLOBAL.deltaTime * this.turnSpeed * direction;
            break;
            case 'KeyQ':
            case 'KeyE':
                var direction = (event.code === 'KeyQ') ? -1 : 1;
                this.roll += GLOBAL.deltaTime * this.turnSpeed * direction;
            break;
            case 'ArrowUp':
            case 'ArrowDown':
                console.log("here");
                var direction = (event.code === 'ArrowUp') ? 1 : -1;
                this.elev += GLOBAL.deltaTime * this.turnSpeed * direction;
            break;
            case 'Space':
            break;
            case 'ShiftLeft':
            break;
        }
    }

    getViewMatrix()
    {
        mat4.identity(this.view);
        mat4.translate(this.view, this.view, [this.px, this.py, this.pz]);
        mat4.rotateX(this.view, this.view, toRadian(this.elev));
        mat4.rotateY(this.view, this.view, toRadian(-this.ang));
        mat4.rotateZ(this.view, this.view, toRadian(this.roll));
        mat4.invert(this.view, this.view); // Inverse to create a proper view matrix
        return this.view;
    }

    mouseDown(event)
    {
    }

    mouseMove(event)
    {
    }

    mouseUp(event)
    {
    }
};