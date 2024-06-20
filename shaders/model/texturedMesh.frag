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
    vec3 baseColor = material.diffuse * texture(samplerDiffuse,v_tex).rgb;
    gColor = vec4(baseColor, material.opacity);
    gEmission = vec4(material.emissive, 1.0);
    gNormal = vec4(0.0);
    gObjectID = vec4(0.0);
}