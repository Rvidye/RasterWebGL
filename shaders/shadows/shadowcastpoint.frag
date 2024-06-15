#version 300 es
precision highp float;

in vec4 v_FragPosLightSpace;
uniform vec3 u_LightPos;
uniform float u_FarPlane;

void main() {
    // Calculate the distance from the light to the fragment
    float lightDistance = length(v_FragPosLightSpace.xyz - u_LightPos);
    // Normalize to [0, 1] range for depth value
    lightDistance = lightDistance / u_FarPlane;
    // Write depth value to depth buffer
    gl_FragDepth = lightDistance;
}
