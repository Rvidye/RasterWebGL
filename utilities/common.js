// Keep All Gloabl Common Stuff here
var GLOBAL = {
	deltaTime: 0,
	lastFrameTime: performance.now()
};

var isAnimating = false;

var currentCamera = null;
var isDebugCameraOn = true;

var canvas = null;
var gl = null;
var lightRenderer = null;
var gBuffer = null;
var exposure = 0.9;
var maxTextureUnits = 16;
var programCubemapRenderer;

const postProcessingSettings = {
	enableHDR: true,
	enableBloom: false,
	enableGodRays: false,
	enableFog: false,
	debugShaow: false,
	enableOutline: false
};

const NONE = 0;
const CAMERA = 1;
const MODEL = 2;
const LIGHT = 3;

var DEBUGMODE = NONE;
const debugModes = ["None", "Camera", "Model", "Light"];

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;
const vec4 = glMatrix.vec4;
const quat = glMatrix.quat;
const toRadian = glMatrix.glMatrix.toRadian;

var globalFade = 1.0; // 0 means show scene , 1 means display scene

function getRandomInRange(min, max) {
	return Math.random() * (max - min) + min;
}

function lerp(start, end, t) {
	return start + t * (end - start);
}

function colorLerp(start, end, t) {

	let finalColor = [0.0, 0.0, 0.0];

	finalColor[0] = lerp(start[0], end[0], t);
	finalColor[1] = lerp(start[1], end[1], t);
	finalColor[2] = lerp(start[2], end[2], t);

	return finalColor;
}