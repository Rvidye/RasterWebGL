#version 300 es

layout(location = 0) in vec4 vPos;
//layout(location = 1) in vec3 vNor;
layout(location = 2) in vec2 vTex;

uniform mat4 pMat;
uniform mat4 vMat;
uniform mat4 mMat;
uniform mat4 nMat; // node matrix
uniform float uTime;

out vec3 v_pos;
//out vec3 v_normal;
out vec2 v_tex;

float random(in vec2 st) {

    return fract(sin(dot(st.xy, vec2(12.9898f, 78.233f))) * 43758.5453123f);

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

float map(float value, float min1, float max1, float min2, float max2) {

    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);

}

void main(void) {
    gl_PointSize = 1.0f;

    vec4 pos = mMat * nMat * vPos;

    v_pos = vec3(pos.xyz) / pos.w;

    v_tex = vTex;
    gl_Position = pMat * vMat * pos;

}
