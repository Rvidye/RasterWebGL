// Keep All Gloabl Common Stuff here
var GLOBAL = {
	deltaTime: 0,
	lastFrameTime: performance.now()
};

var isAnimating = false;
var mute = false;

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
	enableOutline: true
};

const outlineShaderOptions = {
    depthBias : 1.0,
    depthMultiplier : 20.0,
    normalBias : 1.0,
    normalMultiplier : 1.0,
    outlineColor : [1.0,1.0,1.0]
};

const NONE = 0;
const CAMERA = 1;
const MODEL = 2;
const LIGHT = 3;
const SPLINE = 4;

var DEBUGMODE = NONE;
const debugModes = ["None", "Camera", "Model", "Light", "Spline"];

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

/**
 * Creates a look-at matrix.
 * @param {vec3} eye - The position of the eye.
 * @param {vec3} center - The position to look at.
 * @param {vec3} up - The up vector.
 * @returns {mat4} The look-at matrix.
 */
function targetat(eye, center, up) {
    const f = vec3.create();
    vec3.subtract(f, center, eye);
    vec3.normalize(f, f);

    const upN = vec3.create();
    vec3.normalize(upN, up);

    const s = vec3.create();
    vec3.cross(s, f, upN);
    vec3.normalize(s, s);

    const u = vec3.create();
    vec3.cross(u, s, f);
    vec3.normalize(u, u);

    const M = mat4.create();
    M[0] = s[0]; M[4] = u[0]; M[8]  = f[0]; M[12] = 0;
    M[1] = s[1]; M[5] = u[1]; M[9]  = f[1]; M[13] = 0;
    M[2] = s[2]; M[6] = u[2]; M[10] = f[2]; M[14] = 0;
    M[3] = 0;    M[7] = 0;    M[11] = 0;    M[15] = 1;

    return M;
}
