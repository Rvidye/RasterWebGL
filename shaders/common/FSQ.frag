#version 300 es
precision highp float;

layout(location = 0)out vec4 FragColor;
in vec2 texCoord;

uniform sampler2D screenTex;

void main(void) {
	vec3 color = texture(screenTex, texCoord).rgb;
	FragColor = vec4(color, 1.0);
}