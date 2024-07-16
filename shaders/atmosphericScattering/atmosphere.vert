#version 300 es

layout(location = 0)in vec4 vPos;
layout(location = 1) in vec3 vNor;
layout(location = 2) in vec2 vTex;

uniform mat4 pMat;
uniform mat4 vMat;
uniform mat4 mMat;
uniform mat4 nMat; // node matrix
uniform mat4 M;

out vec2 v_tex;
out vec3 v_pos;

void main(void) {
    mat4 view = mat4(mat3(vMat));
	v_tex = vTex;
    v_pos = vec3(M * view * vPos);
    vec4 pos = pMat * view * vPos;
    gl_Position = pos.xyww;
}