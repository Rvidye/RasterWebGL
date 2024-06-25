#version 300 es

//Runs Per Grass_Bled To Calculate below out Parameters
layout(location = 0) in vec4 aInstancePosition;

uniform float uTime;
uniform mat4 vMat;
uniform mat4 pMat;

out float windDir;
out float windLeanAngle;
out float fAngleY;
out float depthOfBlade;

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031f);
    p3 += dot(p3, p3.yzx + 33.33f);
    return fract((p3.x + p3.y) * p3.z);
}

float random(in vec2 st) {

    return fract(sin(dot(st.xy, vec2(12.9898f, 78.233f))) * 43758.5453123f);

}

float map(float value, float min1, float max1, float min2, float max2) {

    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);

}

float noise(in vec2 st) {

    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);

    float b = random(i + vec2(1.0f, 0.0f));

    float c = random(i + vec2(0.0f, 1.0f));

    float d = random(i + vec2(1.0f, 1.0f));

    vec2 u = f * f * (3.0f - 2.0f * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0f - u.x) + (d - b) * u.x * u.y;

}

void main(void) {

    //Increare The below grassBladeMaxDepthLevel value to increase the level of details(wavy effect) of far grass blade
   // float grassBladeMaxDepthLevel = 500.0f;

 //   vec4 tPos = vMat * aInstancePosition;

//    depthOfBlade = -(vMat * aInstancePosition).z / grassBladeMaxDepthLevel;

   // depthOfBlade = clamp(-tPos.z / grassBladeMaxDepthLevel, 0.0f, 1.0f);

    fAngleY = hash12(aInstancePosition.xz) * 2.0f * 3.14159f;

 //   float noiseSample = noise(vec2(uTime) + aInstancePosition.xz);

    windDir = noise(aInstancePosition.xz * 0.05f + 1.75f * uTime);

    windDir = map(windDir, -1.0f, 1.0f, -3.5f, 3.5f);

    float windNoiseSample = noise(aInstancePosition.xz * 0.5f + uTime);

    windLeanAngle = map(windNoiseSample, -1.0f, 1.0f, -1.0f, 1.0f);

}
