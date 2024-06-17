#version 300 es
precision highp float;

layout(location = 0)out vec4 FragColor;
in vec2 texCoord;

uniform sampler2D screenTex;
uniform float fade;

void main(void) {
	vec3 color = texture(screenTex, texCoord).rgb;
	vec3 result = mix(color, vec3(0.0),fade);
	FragColor = vec4(result, 1.0);
}