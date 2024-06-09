#version 300 es

precision highp float;
uniform vec3 lightcolor;

#include<shaders/common/outputs.glsl>

void main(void){
    gColor = vec4(lightcolor,1.0);
    gEmission = vec4(lightcolor,1.0);
    gNormal = vec4(0.0);
    gObjectID = vec4(0.0);
}