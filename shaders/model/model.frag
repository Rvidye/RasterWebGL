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

out vec4 color;
void main(void){

    vec3 normal = normalize(v_normal);
    vec3 diffuseColor = vec3(0.0);

    for(int i = 0; i < u_LightCount; i++){
        Light light = u_Lights[i];
        vec3 pointToLight = light.type == LightType_Directional ? -light.direction : light.position - v_pos;
        vec3 lightIntensity = getLighIntensity(light,pointToLight);
        float diffuseFactor = max(dot(normal,normalize(pointToLight)),0.0);
        diffuseColor += diffuseFactor * lightIntensity;
    }
    vec3 baseColor = material.diffuse * texture(samplerDiffuse,v_tex).rgb;
    color = vec4(baseColor * diffuseColor, material.opacity);
}

