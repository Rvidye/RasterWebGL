#version 300 es
precision highp float;
in vec2 v_tex;

struct material_t {
    vec3 diffuse;
    vec3 emissive;
    float opacity;
};

uniform material_t material;
uniform sampler2D samplerDiffuse;

#include<shaders/common/outputs.glsl>
void main(void) {
    vec4 baseColor = texture(samplerDiffuse,v_tex);
    gColor = baseColor;
    gEmission = vec4(0.0);
    gNormal = vec4(0.0);
    gObjectID = vec4(0.0);
}