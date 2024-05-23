// Keep All Gloabl Common Stuff here
var GLOBAL = {
	deltaTime : 0,
	lastFrameTime : performance.now()
};

var currentCamera = null;
var canvas = null;
var gl = null;
const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;
const quat = glMatrix.quat;
const toRadian = glMatrix.glMatrix.toRadian;
const loader = MinimalGLTFLoader;
