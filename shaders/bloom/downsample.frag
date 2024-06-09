#version 300 es
precision mediump float;
uniform sampler2D srcTexture;
uniform vec2 srcResolution;
uniform int mipLevel;

in vec2 texCoord;
out vec3 downsample;

vec3 PowVec3(vec3 v, float p) {
    return vec3(pow(v.x, p), pow(v.y, p), pow(v.z, p));
}

const float invGamma = 1.0 / 2.2;
vec3 ToSRGB(vec3 v) { return PowVec3(v, invGamma); }

float sRGBToLuma(vec3 col) {
    return dot(col, vec3(0.299, 0.587, 0.114));
}

float KarisAverage(vec3 col) {
    float luma = sRGBToLuma(ToSRGB(col)) * 0.25;
    return 1.0 / (1.0 + luma);
}

void main() {
    vec2 srcTexelSize = 1.0 / srcResolution;
    float x = srcTexelSize.x;
    float y = srcTexelSize.y;

    vec3 a = texture(srcTexture, texCoord + vec2(-2.0 * x,  2.0 * y)).rgb;
    vec3 b = texture(srcTexture, texCoord + vec2(0.0,       2.0 * y)).rgb;
    vec3 c = texture(srcTexture, texCoord + vec2(2.0 * x,   2.0 * y)).rgb;
    vec3 d = texture(srcTexture, texCoord + vec2(-2.0 * x,  0.0)).rgb;
    vec3 e = texture(srcTexture, texCoord).rgb;
    vec3 f = texture(srcTexture, texCoord + vec2(2.0 * x,   0.0)).rgb;
    vec3 g = texture(srcTexture, texCoord + vec2(-2.0 * x, -2.0 * y)).rgb;
    vec3 h = texture(srcTexture, texCoord + vec2(0.0,      -2.0 * y)).rgb;
    vec3 i = texture(srcTexture, texCoord + vec2(2.0 * x,  -2.0 * y)).rgb;
    vec3 j = texture(srcTexture, texCoord + vec2(-1.0 * x,  1.0 * y)).rgb;
    vec3 k = texture(srcTexture, texCoord + vec2(1.0 * x,   1.0 * y)).rgb;
    vec3 l = texture(srcTexture, texCoord + vec2(-1.0 * x, -1.0 * y)).rgb;
    vec3 m = texture(srcTexture, texCoord + vec2(1.0 * x,  -1.0 * y)).rgb;

    vec3 groups[5];
    if (mipLevel == 0) {
        groups[0] = (a + b + d + e) * (0.125 / 4.0);
        groups[1] = (b + c + e + f) * (0.125 / 4.0);
        groups[2] = (d + e + g + h) * (0.125 / 4.0);
        groups[3] = (e + f + h + i) * (0.125 / 4.0);
        groups[4] = (j + k + l + m) * (0.5 / 4.0);
        groups[0] *= KarisAverage(groups[0]);
        groups[1] *= KarisAverage(groups[1]);
        groups[2] *= KarisAverage(groups[2]);
        groups[3] *= KarisAverage(groups[3]);
        groups[4] *= KarisAverage(groups[4]);
        downsample = groups[0] + groups[1] + groups[2] + groups[3] + groups[4];
        downsample = max(downsample, 0.0001);
    } else {
        downsample = e * 0.125;
        downsample += (a + c + g + i) * 0.03125;
        downsample += (b + d + f + h) * 0.0625;
        downsample += (j + k + l + m) * 0.125;
    }
}
