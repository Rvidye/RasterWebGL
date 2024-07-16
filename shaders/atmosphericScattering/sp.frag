#version 300 es
precision highp float;

in vec2 oTexcoord;
//out vec4 oFragColor;

#include<shaders/common/outputs.glsl>

void main(void) {
    gColor = vec4(1.0,0.0,0.0,1.0);
    gEmission = vec4(0.0f);
    gNormal = vec4(0.0f);
    gObjectID = vec4(0.0f);
}
