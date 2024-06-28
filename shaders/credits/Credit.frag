#version 300 es
precision highp float;

#include<shaders/common/outputs.glsl>
in vec2 texCoord;

uniform sampler2D screenTex;
uniform float fade;

void main(void) {
	vec3 color = texture(screenTex, texCoord).rgb;
	vec3 result = mix(color, vec3(0.0),fade);
    gColor = vec4(result, 1.0);
    gEmission = vec4(result,1.0);
    gNormal = vec4(0.0);
    gObjectID = vec4(0.0);
}