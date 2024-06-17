#version 300 es

precision highp float;

in vec3 v_pos;
in vec3 v_normal;
in vec2 v_tex;

#include<shaders/common/lights.glsl>

struct material_t {
    vec3 diffuse;
    vec3 emissive;
    float opacity;
};

uniform material_t material;
uniform bool useTexture;
uniform sampler2D samplerDiffuse;
uniform vec3 viewPos;
uniform vec4 objectID;

#include<shaders/common/outputs.glsl>

void main(void) {

    vec3 normal = normalize(v_normal);
    vec3 V = normalize(viewPos - v_pos);
    vec3 diffuseColor = vec3(0.0f);

    for(int i = 0; i < u_LightCount; i++) {
        if(u_Lights[i].type == LightType_Directional) {
            diffuseColor += calculateDirectionalLightDiffuseToon(u_Lights[i], normal);
        } else if(u_Lights[i].type == LightType_Point) {
            diffuseColor += calculatePointLightDiffuseToon(u_Lights[i], v_pos, normal);
        } else if(u_Lights[i].type == LightType_Spot) {
            diffuseColor += calculateSpotLightDiffuseToon(u_Lights[i], v_pos, normal);
        }
    }
    vec3 baseColor = material.diffuse * ((useTexture) ? texture(samplerDiffuse,v_tex).rgb : vec3(1.0));
    diffuseColor *= baseColor;

    //rim Lighting
    vec3 rimLight = baseColor * rimLightIntensityFactor(v_normal, V);
    gColor = vec4(diffuseColor, material.opacity);

    gEmission = vec4(material.emissive, material.opacity);
    gNormal = vec4(normal, 1.0f);
    gObjectID = objectID;
}
