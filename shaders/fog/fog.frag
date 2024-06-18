#version 300 es
precision highp float;

in vec2 texCoord;
uniform sampler2D colorTexture;
uniform sampler2D depthTexture;

//uniform vec2 nearFar;
//out vec4 oFragColor;

#include<shaders/common/outputs.glsl>

#define LINEAR_FOG 0
#define EXP2_FOG 1
#define FOG_TYPE EXP2_FOG

void main(void) {

    vec4 fogColor = vec4(0.75f, 0.75f, 0.75f, 1.0f);
    vec4 diffuseColor = texture(colorTexture, texCoord);

    float curDepth = texture(depthTexture, texCoord).r;

    //Change below value for the fog depth
    float fogStart = 0.99988f;
    float fogEnd = 1.0f;

    float fogRange = fogEnd - fogStart;

    float fogDist = fogEnd - curDepth;

    float fogFactor = fogDist / fogRange;

    fogFactor = clamp(fogFactor, 0.0f, 1.0f);

//Linear Fog
#if FOG_TYPE == LINEAR_FOG
    gColor = mix(fogColor, diffuseColor, fogFactor);

//Expnonetial fog   
#else   
    float distRatio = 4.0f * fogDist / fogEnd;
    float fogDensity = 3000.0f;
    fogFactor = exp(-distRatio * fogDensity * distRatio * fogDensity);
    gColor = mix(diffuseColor, fogColor, fogFactor);

#endif

 //   gColor = diffuseColor;

}
