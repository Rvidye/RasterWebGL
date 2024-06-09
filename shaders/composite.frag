#version 300 es
precision highp float;

const int MAX_TEXTURES = 8; // Maximum number of textures to blend

layout(location = 0)out vec4 FragColor;
in vec2 texCoord;

uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uTexture3;
uniform sampler2D uTexture4;
uniform sampler2D uTexture5;
uniform sampler2D uTexture6;
uniform sampler2D uTexture7;
uniform int uTextureCount; // Number of textures to blend

void main(void) {
    vec4 color = vec4(0.0);
    if (uTextureCount > 0) color += texture(uTexture0, texCoord);
    if (uTextureCount > 1) color += texture(uTexture1, texCoord);
    if (uTextureCount > 2) color += texture(uTexture2, texCoord);
    if (uTextureCount > 3) color += texture(uTexture3, texCoord);
    if (uTextureCount > 4) color += texture(uTexture4, texCoord);
    if (uTextureCount > 5) color += texture(uTexture5, texCoord);
    if (uTextureCount > 6) color += texture(uTexture6, texCoord);
    if (uTextureCount > 7) color += texture(uTexture7, texCoord);
    FragColor = color;
}