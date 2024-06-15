#version 300 es

layout(location = 0) in vec4 vPos;
layout(location = 1) in vec3 vNor;
layout(location = 2) in vec2 vTex;
layout(location = 3) in ivec4 vBoneIds;  // Bone IDs
layout(location = 4) in vec4 vWeights;   // Bone weights

uniform mat4 pvMat;
uniform mat4 mMat;
uniform mat4 nMat; // node matrix
uniform mat4 bMat[100]; // Bone matrices

uniform bool useSkinning; // Boolean to determine if skinning is used

void main() {
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
    gl_Position = pvMat * pos;
}