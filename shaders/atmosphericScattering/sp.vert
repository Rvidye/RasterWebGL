#version 300 es
layout(location = 0) in vec4 aPosition;
layout(location = 2) in vec2 aTexcoord;

uniform mat4 mMat;
uniform mat4 vMat;
uniform mat4 pMat;

out vec2 oTexcoord;

void main(void) {

    gl_Position = pMat * vMat * mMat * aPosition;

    oTexcoord = aTexcoord;

}
