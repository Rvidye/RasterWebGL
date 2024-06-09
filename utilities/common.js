// Keep All Gloabl Common Stuff here
var GLOBAL = {
	deltaTime : 0,
	lastFrameTime : performance.now()
};

var currentCamera = null;
var canvas = null;
var gl = null;
var lightRenderer = null;

var gBuffer = null;

var exposure = 0.9;

const postProcessingSettings = {
	enableHDR: true,
	enableBloom: false,
	enableGodRays: true,
	enableFog: true,
};

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const quat = glMatrix.quat;
const toRadian = glMatrix.glMatrix.toRadian;

function getRandomInRange(min, max)  {
	return Math.random() * (max - min) + min;
}