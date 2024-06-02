#version 300 es

layout(location = 0)in vec4 vPos;
layout(location = 1)in vec3 vNor;
layout(location = 2)in vec2 vTex;
layout(location = 3)in ivec4 vBoneIds;
layout(location = 4)in vec4 vWeights;

uniform mat4 pMat;
uniform mat4 vMat;
uniform mat4 mMat;
uniform mat4 nMat; //node matrix not normal matrix
uniform mat4 bMat[100];

out vec3 v_pos;
out vec3 v_normal;
out vec2 v_tex;

void main(void) {

	gl_PointSize = 1.0;
	vec4 totalPosition = vec4(0.0);
	vec3 totalNormal = vec3(0.0);
	for(int i = 0 ; i < 4; i++) {
		if(vBoneIds[i] == -1) {
			continue;
		}
		vec4 localPosition = bMat[vBoneIds[i]] * vPos;
		totalPosition += localPosition * vWeights[i];
		vec3 localNormal = mat3(bMat[vBoneIds[i]]) * vNor;
		totalNormal += localNormal;
	}
    vec4 pos = mMat * nMat * totalPosition;
    v_pos = vec3(pos.xyz) / pos.w;
	gl_Position = pMat * vMat * pos;
    v_tex = vTex;
    v_normal = mat3(mMat) * vNor;
}

