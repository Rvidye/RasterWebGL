#version 300 es
precision highp float;

#define M_PI 3.1415926535897932384626433832795
in vec2 v_tex;
in vec3 v_pos;

// Atmospheric scattering uniforms
uniform vec3 viewPos;
uniform vec3 sunPos;
uniform int viewSamples;
uniform int lightSamples;
uniform float I_sun;
uniform float R_e;
uniform float R_a;
uniform vec3 beta_R;
uniform float beta_M;
uniform float H_R;
uniform float H_M;
uniform float g;

#include<shaders/common/outputs.glsl>

vec2 raySphereIntersection(vec3 o, vec3 d, float r) {
    float a = dot(d, d);
    float b = 2.0 * dot(d, o);
    float c = dot(o, o) - r * r;
    float delta = b * b - 4.0 * a * c;

    if (delta < 0.0) {
        return vec2(1e5, -1e5);
    }

    float sqrtDelta = sqrt(delta);
    return vec2((-b - sqrtDelta) / (2.0 * a), (-b + sqrtDelta) / (2.0 * a));
}

vec3 computeSkyColor(vec3 ray, vec3 origin) {
    vec3 sunDir = normalize(sunPos);
    vec2 t = raySphereIntersection(origin, ray, R_a);
    if (t.x > t.y) {
        return vec3(0.0, 0.0, 0.0);
    }

    t.y = min(t.y, raySphereIntersection(origin, ray, R_e).x);
    float segmentLen = (t.y - t.x) / float(viewSamples);
    float tCurrent = 0.0;

    vec3 sum_R = vec3(0);
    vec3 sum_M = vec3(0);
    float optDepth_R = 0.0;
    float optDepth_M = 0.0;

    float mu = dot(ray, sunDir);
    float mu_2 = mu * mu;

    float phase_R = 3.0 / (16.0 * M_PI) * (1.0 + mu_2);
    float g_2 = g * g;
    float phase_M = 3.0 / (8.0 * M_PI) * ((1.0 - g_2) * (1.0 + mu_2)) / ((2.0 + g_2) * pow(1.0 + g_2 - 2.0 * g * mu, 1.5));

    for (int i = 0; i < viewSamples; ++i) {
        vec3 vSample = origin + ray * (tCurrent + segmentLen * 0.5);
        float height = length(vSample) - R_e;
        float h_R = exp(-height / H_R) * segmentLen;
        float h_M = exp(-height / H_M) * segmentLen;
        optDepth_R += h_R;
        optDepth_M += h_M;

        float segmentLenLight = raySphereIntersection(vSample, sunDir, R_a).y / float(lightSamples);
        float tCurrentLight = 0.0;
        float optDepthLight_R = 0.0;
        float optDepthLight_M = 0.0;

        for (int j = 0; j < lightSamples; ++j) {
            vec3 lSample = vSample + sunDir * (tCurrentLight + segmentLenLight * 0.5);
            float heightLight = length(lSample) - R_e;
            optDepthLight_R += exp(-heightLight / H_R) * segmentLenLight;
            optDepthLight_M += exp(-heightLight / H_M) * segmentLenLight;
            tCurrentLight += segmentLenLight;
        }
        vec3 att = exp(-(beta_R * (optDepth_R + optDepthLight_R) + beta_M * 1.1 * (optDepth_M + optDepthLight_M)));
        sum_R += h_R * att;
        sum_M += h_M * att;
        tCurrent += segmentLen;
    }
    return I_sun * (sum_R * beta_R * phase_R + sum_M * beta_M * phase_M);
}


void main(void) {
    vec3 ray = normalize(vec3(v_tex, 1.0)); // Adjust this based on your sky dome's tex coords
    vec3 acolor = computeSkyColor(normalize(v_pos-viewPos), viewPos);
    gColor = vec4(acolor,1.0);
    gEmission = vec4(0.0);
    gNormal = vec4(0.0);
    gObjectID = vec4(0.0);
}