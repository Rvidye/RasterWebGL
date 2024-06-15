#version 300 es
precision highp float;

layout(location = 0)out vec4 FragColor;
in vec2 texCoord;

uniform sampler2D shadowTex;

void main(void) {
	float depth = texture(shadowTex, texCoord).r;
	FragColor = vec4(vec3(depth), 1.0); // Visualize depth as grayscale
}