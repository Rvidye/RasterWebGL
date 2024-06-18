#version 300 es

precision highp float;

in vec3 v_pos;
//in vec3 v_normal;
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

uniform sampler2D dudvMap;
uniform sampler2D normalMap;
uniform float moveFactor;

float pondWaterAlpha = 0.45f;

#include<shaders/common/outputs.glsl>
void main(void) {

    vec2 tTex = v_tex + (texture(dudvMap, vec2(v_tex.x + moveFactor, v_tex.y)).rg * 2.0f - 1.0f) * 0.01f;

    vec3 v_normal = texture(normalMap, tTex).rbg;

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

    vec3 baseColor = material.diffuse * texture(samplerDiffuse, tTex).rgb;
    gColor = vec4(baseColor * diffuseColor + specularColor, pondWaterAlpha);
    gEmission = vec4(material.emissive, pondWaterAlpha);
    gNormal = vec4(normal, 1.0f);
    gObjectID = objectID;
}
