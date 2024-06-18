"use strict";

class SceneCamera extends camera {
    constructor(positionKeyFrames, frontKeyFrames) {
        super();
        assert(
            positionKeyFrames.length > 0,
            "SceneCamera cannot take empty positionKeyFrames vector"
        );
        assert(
            frontKeyFrames.length > 0,
            "SceneCamera cannot take empty frontKeyFrames vector"
        );

        this.m_bspPositions = new BsplineInterpolator(positionKeyFrames);
        this.m_bspFront = new BsplineInterpolator(frontKeyFrames);
        this.t = 0.0;
    }

    updateT(speed) {
        this.t = Math.min(this.t + speed, 1.0);
    }

    resetT() {
        this.t = 0.0;
    }

    setT(t) {
        this.t = t;
    }

    getT() {
        return this.t;
    }

    getViewMatrix() {
        const up = [0.0, 1.0, 0.0];
        const eye = this.m_bspPositions.interpolateSpline(this.t);
        const center = this.m_bspFront.interpolateSpline(this.t);
        mat4.lookAt(this.view, eye, center, up);
        return this.view;
    }

    getPosition() {
        return this.m_bspPositions.interpolateSpline(this.t);
    }

    getFront() {
        return this.m_bspFront.interpolateSpline(this.t);
    }

    printVectors() {
        console.log("Position: {");
        for (let pos of this.m_bspPositions.getPoints()) {
            console.log(`\t${pos},`);
        }
        console.log("}");
        console.log("Front: {");
        for (let front of this.m_bspFront.getPoints()) {
            console.log(`\t${front},`);
        }
        console.log("}");
    }
};
