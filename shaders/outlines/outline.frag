#version 300 es
precision highp float;


layout(location = 0)out vec4 FragColor;

in vec2 texCoord;

uniform sampler2D colorTexture;
uniform sampler2D normalTexture;
uniform sampler2D depthTexture;

uniform float cameraNear;
uniform float cameraFar;
uniform vec4 screenSize;
uniform vec3 outlineColor;
uniform vec4 multiplierParameters;
uniform int debugVisualize;

float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
    return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float linearClipZ, const in float near, const in float far ) {
    return linearClipZ * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
    return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float invClipZ, const in float near, const in float far ) {
    return ( near * far ) / ( ( far - near ) * invClipZ - far );
}

float readDepth (sampler2D depthSampler, vec2 coord) {
    float fragCoordZ = texture(depthSampler, coord).x;
    float viewZ = (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - fragCoordZ * (cameraFar - cameraNear));
    return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
}

// Helper functions for reading normals and depth of neighboring pixels.
float getPixelDepth(int x, int y) {
    return readDepth(depthTexture, texCoord + screenSize.zw * vec2(x, y));
}

// "surface value" is either the normal or the "surfaceID"
vec3 getSurfaceValue(int x, int y) {
    vec3 val = texture(normalTexture, texCoord + screenSize.zw * vec2(x, y)).rgb;
    return val;
}

float getSufaceIdDiff(vec3 surfaceValue) {
    float surfaceIdDiff = 0.0;
    surfaceIdDiff += length(surfaceValue - getSurfaceValue(1, 0));
    surfaceIdDiff += length(surfaceValue - getSurfaceValue(0, 1));
    surfaceIdDiff += length(surfaceValue - getSurfaceValue(0, 1));
    surfaceIdDiff += length(surfaceValue - getSurfaceValue(0, -1));
    surfaceIdDiff += length(surfaceValue - getSurfaceValue(1, 1));
    surfaceIdDiff += length(surfaceValue - getSurfaceValue(1, -1));
    surfaceIdDiff += length(surfaceValue - getSurfaceValue(-1, 1));
    surfaceIdDiff += length(surfaceValue - getSurfaceValue(-1, -1));
    return surfaceIdDiff;
}

void main(void) {
    float depth = getPixelDepth(0,0);
    vec3 normal = texture(normalTexture,texCoord).rgb;
    float depthDiff = 0.0;
    depthDiff += abs(depth - getPixelDepth(1,0));
    depthDiff += abs(depth - getPixelDepth(-1,0));
    depthDiff += abs(depth - getPixelDepth(0,1));
    depthDiff += abs(depth - getPixelDepth(0,-1));
    // Get the difference between normals of neighboring pixels and current
    float surfaceValueDiff = getSufaceIdDiff(normal);
    float depthBias = multiplierParameters.x;
    float depthMultiplier = multiplierParameters.y;
    float normalBias = multiplierParameters.z;
    float normalMultiplier = multiplierParameters.w;
    depthDiff = depthDiff * depthMultiplier;
    depthDiff = clamp(depthDiff,0.0,1.0);
    depthDiff = pow(depthDiff, depthBias);
    surfaceValueDiff = surfaceValueDiff * normalMultiplier;
    surfaceValueDiff = clamp(surfaceValueDiff,0.0,1.0);
    surfaceValueDiff = pow(surfaceValueDiff, normalBias);
    float outline = clamp(surfaceValueDiff + depthDiff,0.0,1.0);
    vec4 outlineColor = vec4(outlineColor, 1.0);
    FragColor = vec4(vec3(outline * outlineColor),1.0);//vec4(mix(diffuseColor,outlineColor,outline));
}
