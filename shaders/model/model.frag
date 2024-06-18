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
uniform sampler2D samplerDiffuse;
uniform vec3 viewPos;
uniform vec4 objectID;

#include<shaders/common/outputs.glsl>
void main(void) {

    vec3 normal = normalize(v_normal);
    vec3 V = normalize(viewPos - v_pos);
    vec3 diffuseColor = vec3(0.0f);
    vec3 specularColor = vec3(0.0f);

    for(int i = 0; i < u_LightCount; i++) {
        if(u_Lights[i].type == LightType_Directional) {
            diffuseColor += calculateDirectionalLightDiffuse(u_Lights[i], normal);
            specularColor += calculateDirectionalLightSpecular(u_Lights[i], normal, V);
        } else if(u_Lights[i].type == LightType_Point) {
            diffuseColor += calculatePointLightDiffuse(u_Lights[i], v_pos, normal);
            specularColor += calculatePointLightSpecular(u_Lights[i], v_pos, normal, V);
        } else if(u_Lights[i].type == LightType_Spot) {
            diffuseColor += calculateSpotLightDiffuse(u_Lights[i], v_pos, normal);
            specularColor += calculateSpotLightSpecular(u_Lights[i], v_pos, normal, V);
        }
    }

    float shadow = 0.0f;
    for(int i = 0; i < u_LightCount; i++) {
        if(u_Lights[i].shadows == 1) {
            if(u_Lights[i].type == LightType_Directional || u_Lights[i].type == LightType_Spot) {
                vec4 fragPosLightSpace = u_LightSpaceMatrices[u_Lights[i].shadowMapIndex] * vec4(v_pos, 1.0f);
                shadow += ShadowCalculation(fragPosLightSpace, u_Lights[i].shadowMapIndex);
            } else if(u_Lights[i].type == LightType_Point) {
                shadow += ShadowCalculationPoint(v_pos, u_Lights[i].position, u_Lights[i].shadowMapIndex, u_Lights[i].range);
            }
        }
    }
    diffuseColor = (1.0f - shadow) * diffuseColor;

    vec3 baseColor = material.diffuse * texture(samplerDiffuse, v_tex).rgb;

    vec3 finalColor = mix(baseColor * diffuseColor + specularColor, vec3(0.0f), shadow);
    gColor = vec4(finalColor, material.opacity);
    gEmission = vec4(material.emissive, material.opacity);
    gNormal = vec4(normal, 1.0f);
    gObjectID = objectID;
}