#version 300 es
precision highp float;

uniform sampler2D texObj;

in vec2 oTexcoord;
//out vec4 oFragColor;

#include<shaders/common/outputs.glsl>

void main(void) {

    gColor = texture(texObj, oTexcoord);
    gEmission = vec4(0.0f);
    gNormal = vec4(0.0f);
    gObjectID = vec4(0.0f);
}
