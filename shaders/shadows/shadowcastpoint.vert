#version 300 es

layout(location = 0) in vec4 vPos;
layout(location = 1) in vec3 vNor;
layout(location = 2) in vec2 vTex;
layout(location = 3) in ivec4 vBoneIds;  // Bone IDs
layout(location = 4) in vec4 vWeights;   // Bone weights

uniform mat4 mMat;
uniform mat4 nMat; // node matrix
uniform mat4 bMat[100]; // Bone matrices

uniform bool useSkinning; // Boolean to determine if skinning is used

uniform mat4 pvMat; // Array of light space matrices for each face of the cubemap
uniform vec3 lightPos;

out vec4 v_FragPosLightSpace;

void main() {
    gl_PointSize = 1.0;
    vec4 pos;

    if (useSkinning) {
        // Skinning calculations
        vec4 totalPosition = vec4(0.0);
        for (int i = 0; i < 4; i++) {
            if (vBoneIds[i] == -1) {
                continue;
            }
            vec4 localPosition = bMat[vBoneIds[i]] * vPos;
            totalPosition += localPosition * vWeights[i];
        }
        pos = mMat * nMat * totalPosition;
    } else {
        pos = mMat * nMat * vPos;
    }
    v_FragPosLightSpace = pvMat * pos;
    gl_Position = pvMat* pos;
}