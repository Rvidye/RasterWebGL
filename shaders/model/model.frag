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
void main(void){

    vec3 normal = normalize(v_normal);
    vec3 V = normalize(viewPos - v_pos);
    vec3 diffuseColor = vec3(0.0);
    vec3 specularColor = vec3(0.0);
    
    for(int i = 0; i < u_LightCount; i++){
        if (u_Lights[i].type == LightType_Directional) {
            diffuseColor += calculateDirectionalLightDiffuse(u_Lights[i], normal);
            specularColor += calculateDirectionalLightSpecular(u_Lights[i], normal, V);
        } else if (u_Lights[i].type == LightType_Point) {
            diffuseColor += calculatePointLightDiffuse(u_Lights[i], v_pos, normal);
            specularColor += calculatePointLightSpecular(u_Lights[i], v_pos, normal, V);
        } else if (u_Lights[i].type == LightType_Spot) {
            diffuseColor += calculateSpotLightDiffuse(u_Lights[i], v_pos, normal);
            specularColor += calculateSpotLightSpecular(u_Lights[i], v_pos, normal, V);
        }
    }

    vec3 baseColor = material.diffuse * texture(samplerDiffuse,v_tex).rgb;
    gColor = vec4( baseColor * diffuseColor + specularColor, material.opacity);
    gEmission = vec4(material.emissive,material.opacity);
    gNormal = vec4(normal,1.0);
    gObjectID = objectID;
}