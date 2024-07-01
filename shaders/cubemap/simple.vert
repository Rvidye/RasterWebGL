#version 300 es

layout(location = 0)in vec4 vPos;
layout(location = 1) in vec3 vNor;
layout(location = 2) in vec2 vTex;
uniform mat4 pMat;
uniform mat4 vMat;
uniform mat4 mMat;
uniform mat4 nMat; // node matrix

out vec2 v_tex;

void main(void) {
    vec4 pos = pMat * vMat * mMat * vPos;
    gl_Position = pos;
	v_tex = vTex;
}