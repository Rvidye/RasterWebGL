#version 300 es 

uniform mat4 mMat;

uniform mat4 vMat;

uniform mat4 pMat;

uniform float pitch;

uniform float yaw;

uniform float bendStrength;

uniform float uTime;

out vec2 oTexCoords;

float random(in vec2 st) {

    return fract(sin(dot(st.xy, vec2(12.9898f, 78.233f))) * 43758.5453123f);

}

void main(void) {

    float yawN = yaw + 1.0f * float(gl_InstanceID % 6) + float(gl_InstanceID) / 12.0f;

    float pitchN = pitch + 0.2f * floor(float(gl_InstanceID) / 6.0f);

    vec3 position = vec3(0.0f);

    float width = mod(float(gl_VertexID), 2.0f) - 0.5f;

    float distance = floor(float(gl_VertexID) / 2.0f);

    float time = uTime - distance - float(gl_InstanceID);

    float wind = sin(time) - sin(time / 2.0f) + sin(time / 4.0f) - sin(time / 8.0f);

    float bendPitch = pitchN + distance * bendStrength;

    float totalPitch = pitchN + distance * bendStrength + wind * 0.04f;

    position.x = 2.0f * (cos(yawN) * -width + cos(bendPitch) * distance * sin(yawN));

    position.y = sin(totalPitch) * distance;

    position.z = 2.0f * (sin(yawN) * width + cos(bendPitch) * distance * cos(yawN));

    oTexCoords = vec2(float(gl_VertexID % 2), 1.0f / 5.0f * floor(float(gl_VertexID) / 2.0f));

    gl_Position = pMat * vMat * mMat * vec4(position, 1.0f);

}
