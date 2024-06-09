"use strict"

var loadedTextures = {}
var modelList = [
	{ name: "test2", files:[ 'models/cube.glb'], flipTex:true },
	{ name: "test1", files:[ 'models/cube/AnimatedCube.gltf', 'models/cube/AnimatedCube.bin'], flipTex:true },
	{ name: "test3", files:[ 'models/cesiumman/CesiumMan.gltf', 'models/cesiumman/CesiumMan_data.bin'], flipTex:true },
	{ name: "arrow", files:[ 'models/lightmesh/arrow.obj'], flipTex:false },
	{ name: "cone", files:[ 'models/lightmesh/cone.obj'], flipTex:false },
	{ name: "point", files:[ 'models/lightmesh/point.obj'], flipTex:false },
]

var scenes = [];
var currentSceneIndex = 0;
var debugCamera;
var fpsElem;

// global in main.js
var emptyVao;
var programFSQ;

var bloom;
var composite;
var tonemap;

assimpjs().then(function (ajs) {
	if (true) {
		Promise.all(modelList.flatMap(o => o.files).map((fileToLoad) => fetch(fileToLoad))).then((responses) => {
			return Promise.all(responses.map((res) => res.arrayBuffer()))
		}).then((arrayBuffers) => {
			var k = 0
			for (var i = 0; i < modelList.length; i++) {
				console.log("Loading Files for " + modelList[i].name + "....");
				let fileList = new ajs.FileList();
				for (let j = 0; j < modelList[i].files.length; j++) {
					fileList.AddFile(modelList[i].files[j], new Uint8Array(arrayBuffers[k++]));
				}
				console.log("Loaded Files");
				console.log("Converting Files to AssimpJSON....");
				let result = ajs.ConvertFileList(fileList, 'assjson');
				if (!result.IsSuccess() || result.FileCount() == 0) {
					console.log(result.GetErrorCode());
					console.log(result);
					return;
				}
				console.log("Converted Files");
				console.log("Parse JSON String....");
				let resultFile = result.GetFile(0);
				let jsonContent = new TextDecoder().decode(resultFile.GetContent());
				let resultJson = JSON.parse(jsonContent);
				console.log("Parsed JSON");
				modelList[i].json = resultJson;
				modelList[i].directory = modelList[i].files[0].substring(0, modelList[i].files[0].lastIndexOf('/'));
				console.log(resultJson);
			}
			main();
		})
	} else {
		main()
	}
});

function main() {

	canvas = document.createElement("canvas");
	gl = canvas.getContext("webgl2");
	const extColorBufferFloat = gl.getExtension("EXT_color_buffer_float");
	const extFloatBlend = gl.getExtension("EXT_float_blend");
	const oesTextureFloatLinear = gl.getExtension("OES_texture_float_linear");
	
	if (!extColorBufferFloat || !extFloatBlend || !oesTextureFloatLinear) {
		console.error("Required WebGL extensions are not supported by this browser.");
	}
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	//document.body.style.margin = "0";
	document.body.appendChild(canvas);

	// setup event listners
	window.addEventListener('resize', () => onMyResize());
	window.addEventListener('keydown', (e) => onMyKeyPress(e));
	window.addEventListener('mousedown', (e) => onMyMouseDown(e));
	window.addEventListener('mousemove', (e) => onMyMouseMove(e));
	window.addEventListener('mouseup', (e) => onMyMouseUp(e));
	window.addEventListener('close', (e) => onClose(e));

	gl.clearColor(0.0, 0.0, 1.0, 1.0);
	gl.colorMask(true, true, true, true);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	// create a G Buffer To store all necessary data
	gBuffer = createGBuffer(gl, 2048,2048);

	emptyVao = gl.createVertexArray();

	debugCamera = new DebugCamera();
	currentCamera = debugCamera;

	lightRenderer = new LightRenderer();

	programFSQ = new ShaderProgram(gl,['shaders/common/FSQ.vert','shaders/common/FSQ.frag']);

	tonemap = new ToneMap(gl,"shaders/hdr.vert","shaders/hdr.frag",2048,2048);
	bloom = new Bloom(gl,"shaders/common/FSQ.vert","shaders/bloom/downsample.frag",2048,2048);
	composite = new PostProcessCompositor(gl,"shaders/common/FSQ.vert","shaders/composite.frag",2048,2048);

	// scene setup
	addScene(new tutorial());
	//addScene(new renderGrass());

	fpsElem = document.getElementById('fps');

	initScenes();
	window.requestAnimationFrame(renderFrame);
}

function onMyResize() {
	//console.log("In Resize");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	//gl.viewport(0, 0, canvas.width, canvas.height);
	debugCamera.resizeCamera(window.innerWidth, window.innerHeight);
}

function onMyKeyPress(event) {
	//console.log("In Keypress");
	if (event.code == "KeyF") {
		canvas.requestFullscreen();
	}
	debugCamera.keyboard(event);
	scenes[currentSceneIndex].keyboardfunc(event.code);
}

function onMyMouseDown(event){
	debugCamera.mouseDown(event);
}

function onMyMouseMove(event){
	debugCamera.mouseMove(event);
}

function onMyMouseUp(event){
	debugCamera.mouseUp(event);
}

function onClose(event) {
	console.log("In Close");
}

// Scene related Functions

function addScene(scene) {
	if (scene instanceof Scene) {
		scenes.push(scene);
	} else {
		throw new Error("Added scene must be an instance of SceneBase");
	}
}

function initScenes() {
	scenes.forEach(scene => {
		scene.setupProgram();
		scene.setupCamera();
		scene.init();
	});
}


// just wanted something similar to rendering loop in OpenGL/Win32
function renderFrame(timeStamp) {
	GLOBAL.deltaTime = (timeStamp - GLOBAL.lastFrameTime) * 0.001;
	GLOBAL.lastFrameTime = timeStamp;
	const fps = 1 / GLOBAL.deltaTime;
	fpsElem.textContent = "FPS : " + fps.toFixed(1);
	//console.log("Rendering frame with delta time:", GLOBAL.deltaTime);

	render();
	update();
	requestAnimationFrame(renderFrame);
}

function render() {

	// Render To G Buffer
	gl.bindFramebuffer(gl.FRAMEBUFFER,gBuffer.fbo);
	const drawBuffers = [
	gl.COLOR_ATTACHMENT0, // color
	gl.COLOR_ATTACHMENT1, // emission
	gl.COLOR_ATTACHMENT2, // normals
	gl.COLOR_ATTACHMENT3, // object ID
	];
	gl.drawBuffers(drawBuffers);
	gl.viewport(0, 0, 2048, 2048);
	gl.clearBufferfv(gl.COLOR, 0, [0.1, 0.1, 0.1, 1.0]);
	gl.clearBufferfv(gl.COLOR, 1, [0.0, 0.0, 0.0, 1.0]);
	gl.clearBufferfv(gl.COLOR, 2, [0.0, 0.0, 0.0, 1.0]);
	gl.clearBufferfv(gl.COLOR, 3, [0.0, 0.0, 0.0, 1.0]);
	gl.clearBufferfv(gl.DEPTH, 0, [1.0]);

	if (currentSceneIndex < scenes.length) {
		scenes[currentSceneIndex].render();
	}

	// Apply All Post Process Effect
	let textures = [gBuffer.colorTexture];

	if(postProcessingSettings.enableBloom){
		const bloomTex = bloom.apply(gBuffer.emissionTexture);
		textures.push(bloomTex);
	}

	let finalTexture;
	if(textures.length > 1){
		finalTexture = composite.apply(textures);
	}else{
		finalTexture = gBuffer.colorTexture;
	}
	const hdrTex = tonemap.apply(finalTexture);

	// Render Final Texture To Screen
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearBufferfv(gl.COLOR, 0, [0.1, 0.1, 0.1, 1.0]);
	gl.clearBufferfv(gl.DEPTH, 0, [1.0]);
	programFSQ.use();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, hdrTex);
	gl.uniform1i(programFSQ.getUniformLocation("screenTex"), 0);
	gl.bindVertexArray(emptyVao);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.bindVertexArray(null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.useProgram(null);
}

function update() {
	if (currentSceneIndex < scenes.length) {
		const currentScene = scenes[currentSceneIndex];
		if (currentScene.isCompleted()) {
			if (currentSceneIndex <= scenes.length) {
				currentSceneIndex++;
				if (currentSceneIndex == scenes.length) {
					//currentScene = null;
					//stop renderign now
					cancelAnimationFrame(renderFrame);
				}
			}
			return;
		}
		currentScene.update();
	}
}

//main();


function loadTexture(path, isTexFlipped) {
	if (loadedTextures[path] == undefined) {
		var tbo = gl.createTexture()
		tbo.image = new Image()
		tbo.image.src = path
		console.log("Loading: " + path)
		tbo.image.onload = function () {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isTexFlipped)
			gl.bindTexture(gl.TEXTURE_2D, tbo)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
			// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tbo.image)
			gl.generateMipmap(gl.TEXTURE_2D)
			console.log("Successfully Loaded: " + path)
			gl.bindTexture(gl.TEXTURE_2D, null)
		}
		tbo.image.onerror = function () {
			loadedTextures[path] = undefined
			console.log("Failed Load: " + path)
		}
		loadedTextures[path] = tbo
		return tbo
	} else {
		return loadedTextures[path]
	}
}

function loadTextureCubemap(path, isTexFlipped) {
	var tbo = gl.createTexture()
	var ext = path.substr(path.lastIndexOf("."))
	var apath = path.substr(0, path.lastIndexOf("."))
	var cubemapFaces = [
		{ bind: gl.TEXTURE_CUBE_MAP_POSITIVE_X, name: "px" + ext },
		{ bind: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, name: "nx" + ext },
		{ bind: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, name: "py" + ext },
		{ bind: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, name: "ny" + ext },
		{ bind: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, name: "pz" + ext },
		{ bind: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, name: "nz" + ext },
	]
	var imageData = [null, null, null, null, null, null]
	imageData[0] = new Image()
	imageData[0].src = apath + "/" + cubemapFaces[0].name
	imageData[0].tname = cubemapFaces[0].name
	imageData[0].bind = cubemapFaces[0].bind
	imageData[0].onload = function () {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isTexFlipped)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, tbo)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texImage2D(this.bind, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData[0])
		console.log("Successfully Loaded: " + apath + "/" + this.tname + " at " + this.bind)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
	}
	imageData[1] = new Image()
	imageData[1].src = apath + "/" + cubemapFaces[1].name
	imageData[1].tname = cubemapFaces[1].name
	imageData[1].bind = cubemapFaces[1].bind
	imageData[1].onload = function () {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isTexFlipped)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, tbo)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texImage2D(this.bind, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData[1])
		console.log("Successfully Loaded: " + apath + "/" + this.tname + " at " + this.bind)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
	}
	imageData[2] = new Image()
	imageData[2].src = apath + "/" + cubemapFaces[2].name
	imageData[2].tname = cubemapFaces[2].name
	imageData[2].bind = cubemapFaces[2].bind
	imageData[2].onload = function () {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isTexFlipped)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, tbo)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texImage2D(this.bind, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData[2])
		console.log("Successfully Loaded: " + apath + "/" + this.tname + " at " + this.bind)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
	}
	imageData[3] = new Image()
	imageData[3].src = apath + "/" + cubemapFaces[3].name
	imageData[3].tname = cubemapFaces[3].name
	imageData[3].bind = cubemapFaces[3].bind
	imageData[3].onload = function () {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isTexFlipped)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, tbo)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texImage2D(this.bind, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData[3])
		console.log("Successfully Loaded: " + apath + "/" + this.tname + " at " + this.bind)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
	}
	imageData[4] = new Image()
	imageData[4].src = apath + "/" + cubemapFaces[4].name
	imageData[4].tname = cubemapFaces[4].name
	imageData[4].bind = cubemapFaces[4].bind
	imageData[4].onload = function () {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isTexFlipped)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, tbo)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texImage2D(this.bind, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData[4])
		console.log("Successfully Loaded: " + apath + "/" + this.tname + " at " + this.bind)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
	}
	imageData[5] = new Image()
	imageData[5].src = apath + "/" + cubemapFaces[5].name
	imageData[5].tname = cubemapFaces[5].name
	imageData[5].bind = cubemapFaces[5].bind
	imageData[5].onload = function () {
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, isTexFlipped)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, tbo)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		gl.texImage2D(this.bind, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData[5])
		console.log("Successfully Loaded: " + apath + "/" + this.tname + " at " + this.bind)
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
	}
	return tbo
}

function createGBuffer(gl, width, height) {
	const fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

	// Create textures for each buffer
	const colorTexture = createTexture(gl, width, height, gl.RGBA, gl.FLOAT, gl.RGBA16F);
	const depthTexture = createTexture(gl, width, height, gl.DEPTH_COMPONENT, gl.FLOAT, gl.DEPTH_COMPONENT32F);
	const emissionTexture = createTexture(gl, width, height, gl.RGBA, gl.FLOAT, gl.RGBA16F);
	const normalsTexture = createTexture(gl, width, height, gl.RGBA);
	const objectIdTexture = createTexture(gl, width, height, gl.RGBA);

	gl.bindTexture(gl.TEXTURE_2D, emissionTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);

	// Attach textures to the FBO
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, emissionTexture, 0);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, gl.TEXTURE_2D, normalsTexture, 0);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT3, gl.TEXTURE_2D, objectIdTexture, 0);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

	// Specify the list of draw buffers
	const drawBuffers = [
	  gl.COLOR_ATTACHMENT0, // color
	  gl.COLOR_ATTACHMENT1, // emission
	  gl.COLOR_ATTACHMENT2, // normals
	  gl.COLOR_ATTACHMENT3, // object ID
	];
	gl.drawBuffers(drawBuffers);

	// Check FBO status
	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
		console.error('Framebuffer is not complete');
	}
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	return { fbo, colorTexture, depthTexture, emissionTexture, normalsTexture, objectIdTexture };
}

function createTexture(gl, width, height, format, type = gl.UNSIGNED_BYTE, internalFormat = format) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return texture;
}
