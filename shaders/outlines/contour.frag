#version 300 es
precision highp float;


layout(location = 0)out vec4 FragColor;

in vec2 texCoord;

uniform sampler2D objectIDTexture;
uniform sampler2D normalTexture;
uniform sampler2D depthTexture;

uniform float cameraNear;
uniform float cameraFar;
uniform vec4 screenSize;
uniform vec3 outlineColor;
uniform vec4 multiplierParameters;
uniform int debugVisualize;
uniform int contourMethod;


float Fdepth(float Z, float zNear, float zFar) {
    return abs((1.0 / Z - 1.0 / zNear) / ((1.0 / zFar) - (1.0 / zNear)));
}

float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
    return ( viewZ + near ) / ( near - far );
}

float readDepth (sampler2D depthSampler, vec2 coord) {
    float fragCoordZ = texture(depthSampler, coord).x;
    float viewZ = (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - fragCoordZ * (cameraFar - cameraNear));
    return Fdepth( viewZ, cameraNear, cameraFar );
}

// Decode the color to object ID (assuming the object ID is stored in the RGB channels)
int decodeObjectID(vec3 color) {
    return int(color.r * 255.0) * 65536 + int(color.g * 255.0) * 256 + int(color.b * 255.0);
}

// Helper functions for reading normals and depth of neighboring pixels.
float getPixelDepth(int x, int y) {
    return readDepth(depthTexture, texCoord + screenSize.zw * vec2(x, y));
}

// "surface value" is either the normal or the "surfaceID"
vec3 getSurfaceNormal(int x, int y) {
    return texture(normalTexture, texCoord + screenSize.zw * vec2(x, y)).rgb;
}

int getObjectID(int x, int y) {
    vec3 color = texture(objectIDTexture, texCoord + screenSize.zw * vec2(x, y)).rgb;
    return decodeObjectID(color);
}

vec4 objectContour(vec2 texCoord){

    int A = getObjectID(-1, 1);  // A
    int B = getObjectID(0, 1);   // B
    int C = getObjectID(1, 1);   // C
    int D = getObjectID(-1, 0);  // D
    int X = getObjectID(0, 0);   // X
    int E = getObjectID(1, 0);   // E
    int F = getObjectID(-1, -1); // F
    int G = getObjectID(0, -1);  // G
    int H = getObjectID(1, -1);  // H

    switch (contourMethod) {
        case 0:  // smaller
            if (X < A || X < B || X < C || X < D || X < E || X < F || X < G || X < H) {
                return vec4(1);
            }
            break;
        case 1:  // bigger
            if (X > A || X > B || X > C || X > D || X > E || X > F || X > G || X > H) {
                return vec4(1);
            }
            break;
        case 2:  // thicker
            if (X != A || X != B || X != C || X != D || X != E || X != F || X != G || X != H) {
                return vec4(1);
            }
            break;
        case 3:  // different
            return vec4((float(int(X != A) + int(X != C) + int(X != F) + int(X != H)) * (1.0 / 6.0))
                        + (float(int(X != B) + int(X != D) + int(X != E) + int(X != G)) * (1.0 / 3.0)));
    }
    return vec4(0);
}

float computeGradient(){

    vec3 normalCenter = getSurfaceNormal(0,0);
    if (normalCenter == vec3(0.0)) return 0.0;  // Skip background

    vec4 A = vec4(getSurfaceNormal(-1,1),getPixelDepth(-1,1)); // A
    vec4 B = vec4(getSurfaceNormal(0, 1),getPixelDepth(0, 1)); // B
    vec4 C = vec4(getSurfaceNormal(1, 1),getPixelDepth(1, 1)); // C
    vec4 D = vec4(getSurfaceNormal(-1, 0),getPixelDepth(-1, 0)); // D
    vec4 X = vec4(getSurfaceNormal(0,0),getPixelDepth(0,0)); // X
    vec4 E = vec4(getSurfaceNormal(1, 0),getPixelDepth(1, 0)); // E
    vec4 F = vec4(getSurfaceNormal(-1, -1),getPixelDepth(-1, -1)); // F
    vec4 G = vec4(getSurfaceNormal(0, -1),getPixelDepth(0, -1)); // G
    vec4 H = vec4(getSurfaceNormal(1, -1),getPixelDepth(1, -1)); // H

    // if depth is very less
    if(X.w < 0.0001) {
        return 0.0;
    }

    float Ngrad = 0.0;
    {
        // Compute length of gradient using sobel/kroon operator
        const float k0 = 17.0 / 23.75;
        const float k1 = 61.0 / 23.75;
        vec3 grad_y = k0 * A.xyz + k1 * B.xyz + k0 * C.xyz - k0 * F.xyz - k1 * G.xyz - k0 * H.xyz;
        vec3 grad_x = k0 * C.xyz + k1 * E.xyz + k0 * H.xyz - k0 * A.xyz - k1 * D.xyz - k0 * F.xyz;
        float g = length(grad_x) + length(grad_y);
        Ngrad = smoothstep(2.0,3.0,g * 0.5); // magic
    }

    float Dgrad = 0.0;
    {
        float g = (abs(A.w + 2.0 * B.w + C.w - F.w - 2.0 * G.w - H.w) + abs(C.w + 2.0 * E.w + H.w - A.w - 2.0 * D.w - F.w)) / 8.0;
        float l = (8.0 * X.w - A.w - B.w - C.w - D.w - E.w - F.w - G.w - H.w) / 3.0;
        Dgrad = (l + g) * 1.0;
        Dgrad = smoothstep(0.03, 0.1, Dgrad);  // !magic values
    }
    return Ngrad + Dgrad;
}

void main(void) {
    vec4 objectColor = objectContour(texCoord);
    float normalDepthGradient = computeGradient();
    FragColor = vec4(objectColor.xyz, normalDepthGradient);
}
