#version 300 es
precision highp float;
in vec2 v_tex;

uniform float uTime;
uniform vec2 uResolution;

#include<shaders/common/outputs.glsl>

float hash(vec2 x) {
    return fract(sin(dot(x, vec2(11.0, 57.0))) * 4e3);
}

float star(vec2 x) {
    x *= mat2(cos(0.5), -sin(0.5), sin(0.5), cos(0.5));
    x.y += uTime * 16.0;
    float shape = (1.0 - length(fract(x - vec2(0.0, 0.5)) - 0.5));
    x *= vec2(1.0, 0.1);
    vec2 fr = fract(x);
    float random = step(hash(floor(x)), 0.01);
    float tall = (1.0 - (abs(fr.x - 0.5) + fr.y)) * random;
    return clamp(clamp((shape - random) * step(hash(floor(x + vec2(0.0, 0.05))), 0.01), 0.0, 1.0) + tall, 0.0, 1.0);
}

void main(void) {
    vec2 uv = v_tex;

    float starValue = star(uv * 24.0);
    vec3 col = pow(vec3(starValue * 1.1), vec3(16.0, 6.0, 4.0));  // Calculate color based on star value
    float alpha = starValue > 0.0 ? 1.0 : 0.0; // Set alpha to 1.0 where the star is visible, otherwise 0.0

    vec4 fragColor = vec4(col,alpha);
    gColor = fragColor;
    gEmission = vec4(0.0);
    gNormal = vec4(0.0);
    gObjectID = vec4(0.0);
}