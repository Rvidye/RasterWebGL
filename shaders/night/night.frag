#version 300 es
precision highp float;

in vec2 v_tex;
in vec3 v_pos;

// Atmospheric scattering uniforms
uniform vec3 viewPos;
uniform float time;

#define nsin(x) (sin(x) * 0.5 + 0.5)
#define M_PI 3.1415926535897932384626433832795

#include<shaders/common/outputs.glsl>

// Function to generate random value based on UV coordinates
float rand(vec2 uv) {
    const float a = 12.9898;
    const float b = 78.233;
    const float c = 43758.5453;
    float dt = dot(uv, vec2(a, b));
    float sn = mod(dt, 3.1415); 
    return fract(sin(sn) * c);
}

// Function to draw stars
void draw_stars(inout vec4 color, vec2 uv) {
    float t = sin(time * 2.0 * rand(-uv)) * 0.5 + 0.5;
    float starIntensity = smoothstep(0.995, 1.0, rand(uv)) * t;
    starIntensity = pow(starIntensity, 1.0 / 3.0); // Increase star size
    color += vec4(vec3(starIntensity),1.0);
}

// Function to draw auroras
void draw_auroras(inout vec4 color, vec2 uv) {
    const vec4 aurora_color_a = vec4(0.0, 1.2, 0.5, 1.0);
    const vec4 aurora_color_b = vec4(0.0, 0.4, 0.6, 1.0);
    
    float t = nsin(-time + uv.x * 100.0) * 0.075 + nsin(time + uv.x * distance(uv.x, 0.5) * 100.0) * 0.1 - 0.5;
    t = 1.0 - smoothstep(uv.y - 4.0, uv.y * 2.0, t);
    
    vec4 final_color = mix(aurora_color_a, aurora_color_b, clamp(1.0 - uv.y * t, 0.0, 1.0));
    final_color += final_color * final_color;
    color += final_color * t * (t + 0.5) * 0.75;
}

void main(void) {

    vec3 p = normalize(v_pos);
    float u = atan(p.z, p.x) / (2.0 * M_PI) + 0.5;
    float v = asin(p.y) / M_PI + 0.5;
    vec2 uv = vec2(u,v);

    vec4 col = vec4(0.0);

    draw_stars(col, uv);
    draw_auroras(col, uv);

    gColor = col;
    gEmission = vec4(0.0);
    gNormal = vec4(0.0);
    gObjectID = vec4(0.0);
}