#version 300 es
layout(location = 0) in vec4 aBladeVertex;
layout(location = 1) in vec4 aInstancePosition;
layout(location = 2) in float windDir;
layout(location = 3) in float windLeanAngle;
layout(location = 4) in float fAngleY;
layout(location = 5) in float depthOfBlade;

layout(location = 6) in vec3 aColor;

uniform mat4 pMat;
uniform mat4 vMat;
uniform mat4 mMat;

//uniform mat4 uViewMatrix;

out vec3 difffuseColor;

float hash12(vec2 p) {

    vec3 p3 = fract(vec3(p.xyx) * 0.1031f);

    p3 += dot(p3, p3.yzx + 33.33f);

    return fract((p3.x + p3.y) * p3.z);

}

void main(void) {

   // vec3 baseColor = vec3(0.31f, 0.48f, 0.0f);

    //vec3 tipColor = vec3(0.78f, 0.96f, 0.0f);

    float bladeVertexHeight = (aBladeVertex.y) / (4.465777f + 1.5f);

    mat4 yRotMatrix = mat4(vec4(cos(fAngleY), 0.0f, -sin(fAngleY), 0.0f), vec4(0.0f, 1.0f, 0.0f, 0.0f), vec4(sin(fAngleY), 0.0f, cos(fAngleY), 0.0f), vec4(0.0f, 0.0f, 0.0f, 1.0f));

    //if(float(gl_VertexID) >= clamp(mix(0.0f, 15.0f, depthOfBlade), 0.0f, 15.0f)) {

    float fAngleX = hash12(aInstancePosition.xz) * 3.14159f / 4.0f * bladeVertexHeight;// + noiseSample * bladeVertexHeight  * 0.1;" 
    float fAngleX2 = windDir * windLeanAngle * bladeVertexHeight;

    mat4 xRotMatrix = mat4(vec4(1.0f, 0.0f, 0.0f, 0.0f), vec4(0.0f, cos(fAngleX), sin(fAngleX), 0.0f), vec4(0.0f, sin(fAngleX), cos(fAngleX), 0.0f), vec4(0.0f, 0.0f, 0.0f, 1.0f));

    mat4 xRotMatrix2 = mat4(vec4(1.0f, 0.0f, 0.0f, 0.0f), vec4(0.0f, cos(fAngleX2), sin(fAngleX2), 0.0f), vec4(0.0f, sin(fAngleX2), cos(fAngleX2), 0.0f), vec4(0.0f, 0.0f, 0.0f, 1.0f));

    gl_Position = pMat * vMat * mMat * (xRotMatrix2 * yRotMatrix * xRotMatrix * aBladeVertex + aInstancePosition);

    difffuseColor = aColor; //mix(baseColor, tipColor, bladeVertexHeight);

/*
} else {

difffuseColor = mix(baseColor, tipColor, bladeVertexHeight);
gl_Position = pMat * vMat * mMat * (yRotMatrix * aBladeVertex + aInstancePosition);
}
*/

}
