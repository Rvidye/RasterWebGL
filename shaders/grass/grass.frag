#version 300 es
precision highp float;

in vec3 difffuseColor;
out vec4 FragColor;

void main(void) {

    FragColor = vec4(difffuseColor, 1.0f);

}
