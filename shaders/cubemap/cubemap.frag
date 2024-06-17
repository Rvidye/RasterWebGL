#version 300 es
precision highp float;

uniform samplerCube cubemap;

in vec3 tex;

#include<shaders/common/outputs.glsl>

void main(void) {
    vec4 color = texture(cubemap, tex);
    gColor = vec4(color);
    gEmission = vec4(0.0);
    gNormal = vec4(0.0);
    gObjectID = vec4(0.0);
}