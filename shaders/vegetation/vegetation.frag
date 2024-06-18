#version 300 es

precision highp float;

in vec2 oTexCoords;

uniform sampler2D texObj;

#include<shaders/common/outputs.glsl>

void main(void) {

    if(texture(texObj, oTexCoords).a < 0.1f)
        discard;

    vec4 diffuseColor = texture(texObj, oTexCoords);
    vec3 color = vec3(0.14f, 0.41f, 0.07f);

    gColor = diffuseColor * vec4(0.059f, 0.251f, 0.008f, 1.0f);

    gEmission = vec4(0.0f);
    gNormal = vec4(0.0f);
    gObjectID = vec4(0.0f);
}
