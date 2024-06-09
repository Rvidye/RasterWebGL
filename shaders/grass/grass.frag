#version 300 es
precision highp float;

in vec3 difffuseColor;
#include<shaders/common/outputs.glsl>

void main(void) {
    gColor = vec4(difffuseColor, 1.0);
    gEmission = vec4(0.0);
    gNormal = vec4(0.0);
    gObjectID = vec4(0.0);
}
