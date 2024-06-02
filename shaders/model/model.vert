#version 300 es

layout(location = 0)in vec4 vPos;
layout(location = 1)in vec3 vNor;
layout(location = 2)in vec2 vTex;

uniform mat4 pMat;
uniform mat4 vMat;
uniform mat4 mMat;
uniform mat4 nMat; // node matrix

out vec3 v_pos;
out vec3 v_normal;
out vec2 v_tex;

void main(void){
    gl_PointSize = 1.0;
    vec4 pos = mMat * nMat * vPos;
    v_pos = vec3(pos.xyz) / pos.w;
    v_normal = mat3(mMat) * vNor;
    v_tex = vTex;
    gl_Position = pMat * vMat * pos;
}

