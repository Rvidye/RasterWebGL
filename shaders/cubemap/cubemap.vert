#version 300 es

layout(location = 0)in vec4 vPos;

uniform mat4 pMat;
uniform mat4 vMat;
uniform mat4 mMat;
uniform mat4 nMat; // node matrix

out vec3 tex;

void main(void) {
	mat4 view = mat4(mat3(vMat));
    vec4 pos = pMat * view * vPos;
    gl_Position = pos.xyww;
	tex = vPos.xyz;
}