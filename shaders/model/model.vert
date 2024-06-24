#version 300 es

layout(location = 0) in vec4 vPos;
layout(location = 1) in vec3 vNor;
layout(location = 2) in vec2 vTex;
layout(location = 3) in ivec4 vBoneIds;  // Bone IDs
layout(location = 4) in vec4 vWeights;   // Bone weights

uniform mat4 pMat;
uniform mat4 vMat;
uniform mat4 mMat;
uniform mat4 nMat; // node matrix
uniform mat4 bMat[200]; // Bone matrices

uniform bool useSkinning; // Boolean to determine if skinning is used

out vec3 v_pos;
out vec3 v_normal;
out vec2 v_tex;

void main(void) {
    gl_PointSize = 1.0;

    vec4 pos;
    vec3 normal;

    if (useSkinning) {
        // Skinning calculations
        vec4 totalPosition = vec4(0.0);
        vec3 totalNormal = vec3(0.0);
        for (int i = 0; i < 4; i++) {
            if (vBoneIds[i] == -1) {
                continue;
            }
            vec4 localPosition = bMat[vBoneIds[i]] * vPos;
            totalPosition += localPosition * vWeights[i];
            vec3 localNormal = mat3(bMat[vBoneIds[i]]) * vNor;
            totalNormal += localNormal;
        }
        pos = mMat * nMat * totalPosition;
        normal = mat3(mMat) * totalNormal;
    } else {
        // Standard transformation
        pos = mMat * nMat * vPos;
        normal = mat3(mMat) * vNor;
    }

    v_pos = vec3(pos.xyz) / pos.w;
    v_normal = normal;
    v_tex = vTex;
    gl_Position = pMat * vMat * pos;
}
