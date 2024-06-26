"use strict"

var loadedTextures = {}
var modelList = [


	// { name: "test1", files: ['models/cube/AnimatedCube.gltf', 'models/cube/AnimatedCube.bin'], flipTex: true },
	{ name: "test3", files: ['models/cesiumman/CesiumMan.gltf', 'models/cesiumman/CesiumMan_data.bin'], flipTex: true },
	{ name: "cube", files: ['models/cube.glb'], flipTex: true },
	{ name: "arrow", files: ['models/lightmesh/arrow.obj'], flipTex: false },
	{ name: "cone", files: ['models/lightmesh/cone.obj'], flipTex: false },
	{ name: "point", files: ['models/lightmesh/point.obj'], flipTex: false },
	//{ name: "cat", files: ['models/scene1/cat/cat.gltf', "models/scene1/cat/cat.bin"], flipTex: true },


	{ name: "room1", files: ['models/scene1/room/room3.gltf', "models/scene1/room/room3.bin"], flipTex: true },
	{ name: "book", files: ['models/scene1/book/book.gltf', "models/scene1/book/book.bin"], flipTex: true },
	{ name: "AMC", files: ['models/scene1/intro/amc.glb'], flipTex: false },
	{ name: "RASTER", files: ['models/scene1/intro/raster.glb'], flipTex: false },
	{ name: "nightSky", files: ['models/scene1/night/nightSky.gltf', "models/scene1/night/nightSky.bin"], flipTex: true },
	{ name: "child", files: ['models/scene1/child/child.gltf', "models/scene1/child/child.bin"], flipTex: true },
	{ name: "mother", files: ['models/scene1/mother/mother.gltf','models/scene1/mother/mother.bin'], flipTex: true },
	{ name: "earth", files: ['models/earth/earth.gltf', 'models/earth/earth.bin'], flipTex: true },
	//{ name: "test4", files: ['models/Avocado.glb'], flipTex: true },


	//Elephant Scene Models
	{ name: "terrain", files: ['models/ElephantScene/elp4_3.glb'], flipTex: true },
	{ name: "tree1", files: ['models/ElephantScene/TreeSetup/bigTree.glb'], flipTex: true },
	{ name: "tree2", files: ['models/ElephantScene/TreeSetup/mediumTree.glb'], flipTex: true },
	{ name: "tree3", files: ['models/ElephantScene/TreeSetup/smallTree.glb'], flipTex: true },
	{ name: "treeLog1", files: ['models/ElephantScene/TreeSetup/bigLog.glb'], flipTex: true },
	{ name: "treeLog2", files: ['models/ElephantScene/TreeSetup/mediumLog.glb'], flipTex: true },
	{ name: "treeTrunk1", files: ['models/ElephantScene/TreeSetup/bigTrunk.glb'], flipTex: true },
	{ name: "treeTrunk2", files: ['models/ElephantScene/TreeSetup/mediumTrunk.glb'], flipTex: true },
	{ name: "pondWaterMesh", files: ['models/ElephantScene/pondWaterMesh4.glb'], flipTex: true },
	{ name: "stone1", files: ['models/ElephantScene/stone1/stone1.gltf', 'models/ElephantScene/stone1/stone1.bin'], flipTex: true },
	{ name: "elephantMother", files: ['models/ElephantScene/elephant1/mother.gltf', 'models/ElephantScene/elephant1/mother.bin'], flipTex: true },
	{ name: "elephantCub", files: ['models/ElephantScene/elephant1/baby.gltf', 'models/ElephantScene/elephant1/baby.bin'], flipTex: true },
	{ name: "elephantMother", files: ['models/ElephantScene/elephant1/mother.gltf', 'models/ElephantScene/elephant1/mother.bin'], flipTex: true },
	{ name: "elephantCub", files: ['models/ElephantScene/elephant1/baby.gltf', 'models/ElephantScene/elephant1/baby.bin'], flipTex: true },



	//Kangaroo Scene Models
	{ name: "kangarooTerrain", files: ['models/KangarooScene/terrain/terrain.gltf', 'models/KangarooScene/terrain/terrain.bin'], flipTex: true },
	{ name: "kangarooSceneObjects", files: ['models/KangarooScene/objects/objects.gltf', 'models/KangarooScene/objects/objects.bin'], flipTex: true },
	{ name: "kangarooSceneMountains", files: ['models/KangarooScene/mountains/mountains.gltf', 'models/KangarooScene/mountains/mountains.bin'], flipTex: true },

	{ name: "kangarooMother", files: ['models/kangaroo/mother.gltf', 'models/kangaroo/mother.bin'], flipTex: true },
	{ name: "kangarooJoey", files: ['models/kangaroo/joey.gltf', 'models/kangaroo/joey.bin'], flipTex: true },



]

var scenes = [];
var currentSceneIndex = 0;
var debugCamera;
var fpsElem;

var songPlayer;

// global in main.js
var emptyVao;
var programFSQ;
var programShadowMap;
var programShadowCubeMap;

var bloom;
var composite;
var tonemap;
var outlines;
var shadowMapRender;

var fog;

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
		}).then(() => {
			return eigen.ready;
		}).then(() => {
			return Module(); // Load ImGui module
		}).then((imguimodule) => {
			console.log(imguimodule);
			ImGui.bind = imguimodule;
			return ImGui.default();
		}).then(() => {
			ImGui.CHECKVERSION();
			ImGui.CreateContext();
			ImGui.StyleColorsDark();
			main();
		}).catch((error) => {
			console.error("Error loading libraries: ", error);
		});
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

	maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

	// create a G Buffer To store all necessary data
	gBuffer = createGBuffer(gl, 2048, 2048);

	emptyVao = gl.createVertexArray();

	debugCamera = new DebugCamera();
	currentCamera = debugCamera;

	lightRenderer = new LightRenderer();

	programFSQ = new ShaderProgram(gl, ['shaders/common/FSQ.vert', 'shaders/common/FSQ.frag']);
	programShadowMap = new ShaderProgram(gl, ['shaders/shadows/shadowcast.vert', 'shaders/shadows/shadowcast.frag']);
	programShadowCubeMap = new ShaderProgram(gl, ['shaders/shadows/shadowcastpoint.vert', 'shaders/shadows/shadowcastpoint.frag']);
	programFSQ = new ShaderProgram(gl, ['shaders/common/FSQ.vert', 'shaders/common/FSQ.frag']);
	tonemap = new ToneMap(gl, "shaders/hdr.vert", "shaders/hdr.frag", 2048, 2048);
	bloom = new Bloom(gl, "shaders/common/FSQ.vert", "shaders/bloom/downsample.frag", 2048, 2048);
	fog = new Fog(gl, "shaders/common/FSQ.vert", "shaders/fog/fog.frag", 2048, 2048);
	outlines = new Outline(gl, "shaders/common/FSQ.vert", "shaders/outlines/outline.frag", 2048, 2048);
	composite = new PostProcessCompositor(gl, "shaders/common/FSQ.vert", "shaders/composite.frag", 2048, 2048);
	shadowMapRender = new RenderShadowMap(gl, "shaders/common/FSQ.vert", "shaders/shadows/shadowmap.frag", 1024, 1024);
	programCubemapRenderer = new CubeMapRender(gl, "shaders/cubemap/cubemap.vert", "shaders/cubemap/cubemap.frag");

	songPlayer = document.getElementById("songid");

	// scene setup
	//addScene(new tutorial());
	addScene(new roomScene());
	addScene(new elephantScene());
	addScene(new pageChangeScene());
	addScene(new kangarooScene());
	addScene(new endRoomScene());

	fpsElem = document.getElementById('fps');

	ImGui_Impl.Init(gl);
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
	switch (event.code) {
		case "Tab":
			break;
		case "Space":
			isAnimating = !isAnimating;
			if(isAnimating){
				songPlayer.play();
			}
			else{
				songPlayer.pause();
			}
			break;
		case "F1":
			canvas.requestFullscreen();
			break;
		case "F2":
			isDebugCameraOn = !isDebugCameraOn;
			break;
		case "F3":
			DEBUGMODE = NONE;
			break;
		case "F4":
			resetScene();
			break;
		case "F6":
			DEBUGMODE = CAMERA;
			break;
		case "F7":
			DEBUGMODE = MODEL;
			break;
		case "F9":
			DEBUGMODE = LIGHT;
			break;
		case "F10":
			debugCamera.position = scenes[currentSceneIndex].getCamera().getPosition();
			debugCamera.cameraYaw = -90.0;
			debugCamera.cameraPitch = 0.0;
			break;
	}

	debugCamera.keyboard(event);
	scenes[currentSceneIndex].keyboardfunc(event.code);
}

function onMyMouseDown(event) {
	debugCamera.mouseDown(event);
}

function onMyMouseMove(event) {
	debugCamera.mouseMove(event);
}

function onMyMouseUp(event) {
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

function resetScene() {
}

function handleUI() {
	ImGui.SetNextWindowPos(new ImGui.ImVec2(10, 10), ImGui.Cond.Always);
	ImGui.Begin("Debug Controls", null, ImGui.WindowFlags.AlwaysAutoResize);
	ImGui.Text("Press F1 : Enter Fullscreen Mode");
	const fps = 1 / GLOBAL.deltaTime;
	ImGui.Text(`FPS: ${fps.toFixed(2)}`);

	if (ImGui.Button(isAnimating ? "Stop Animation" : "Start Animation")) {
		isAnimating = !isAnimating;
		if (isAnimating) {
			songPlayer.play();
		}
		else {
			songPlayer.pause();
		}
	}

	if (ImGui.Button(isDebugCameraOn ? "Disable Debug Camera (F2)" : "Enable Debug Camera (F2)")) {
		isDebugCameraOn = !isDebugCameraOn;
	}

	if (ImGui.Button("Reset Scene (F4)")) {
		resetScene();
	}

	if (ImGui.Button("Reset Debug Camera Position and Orientation (F10)")) {
		debugCamera.position = scenes[currentSceneIndex].getCamera().getPosition();
		debugCamera.cameraYaw = -90.0;
		debugCamera.cameraPitch = 0.0;
	}

	ImGui.Text("Post-Processing Settings:");
	if (ImGui.Checkbox("Enable HDR", (value = postProcessingSettings.enableHDR) => postProcessingSettings.enableHDR = value));
	if (ImGui.Checkbox("Enable Bloom", (value = postProcessingSettings.enableBloom) => postProcessingSettings.enableBloom = value));
	if (ImGui.Checkbox("Enable God Rays", (value = postProcessingSettings.enableGodRays) => postProcessingSettings.enableGodRays = value));
	if (ImGui.Checkbox("Enable Fog", (value = postProcessingSettings.enableFog) => postProcessingSettings.enableFog = value));
	if (ImGui.Checkbox("Debug Shadow", (value = postProcessingSettings.debugShadow) => postProcessingSettings.debugShadow = value));
	if (ImGui.Checkbox("Enable Outline", (value = postProcessingSettings.enableOutline) => postProcessingSettings.enableOutline = value));

	ImGui.Text("Scene Time : " + scenes[currentSceneIndex].getSceneTime());

	ImGui.Text("Select Debug Mode:");
	if (ImGui.BeginCombo("", debugModes[DEBUGMODE])) {
		for (let i = 0; i < debugModes.length; i++) {
			if (ImGui.Selectable(debugModes[i], i === DEBUGMODE)) {
				DEBUGMODE = i;
			}
		}
		ImGui.EndCombo();
	}
}

// just wanted something similar to rendering loop in OpenGL/Win32
function renderFrame(timeStamp) {
	GLOBAL.deltaTime = (timeStamp - GLOBAL.lastFrameTime) * 0.001;
	GLOBAL.lastFrameTime = timeStamp;
	const fps = 1 / GLOBAL.deltaTime;
	//fpsElem.textContent = "Debug Mode :"+DEBUGMODE+" FPS : " + fps.toFixed(1);
	//console.log("Rendering frame with delta time:", GLOBAL.deltaTime);
	render();
	update();

	ImGui_Impl.NewFrame();
	ImGui.NewFrame();
	handleUI();

	if (currentSceneIndex < scenes.length) {
		scenes[currentSceneIndex].renderUI();
	}

	ImGui.EndFrame();
	// Render ImGUI
	ImGui.Render();
	ImGui_Impl.RenderDrawData(ImGui.GetDrawData());
	requestAnimationFrame(renderFrame);
}

function renderShadowPass(lightManager) {
	const shadowMapManager = lightManager.getShadowMapManager();
	const shadowCastingLights = lightManager.getShadowCatingLights();

	shadowCastingLights.forEach((light) => {
		const shadowMap = shadowMapManager.getShadowMaps()[light.shadowIndex];

		if (shadowMap === undefined) {
			console.warn("No shadow map found for the light.");
			return;
		}

		if (light.type === 0 || light.type === 2) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMap.framebuffer);
			gl.viewport(0, 0, SHADOWMAP_SIZE, SHADOWMAP_SIZE);
			gl.clear(gl.DEPTH_BUFFER_BIT);

			programShadowMap.use();
			// Compute light's view and projection matrices
			let lightSpaceMatrix = computeLightSpaceMatrix(light);
			gl.uniformMatrix4fv(programShadowMap.getUniformLocation('pvMat'), false, lightSpaceMatrix);
			// Render the scene from the light's perspective
			if (currentSceneIndex < scenes.length) {
				scenes[currentSceneIndex].renderShadow(programShadowMap);
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		} else if (light.type === 1) {
			// Render to each face of the cube map
			gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMap.framebuffer);
			for (let face = 0; face < 6; face++) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, shadowMap.texture, 0);
				gl.viewport(0, 0, SHADOWMAP_SIZE, SHADOWMAP_SIZE);
				gl.clear(gl.DEPTH_BUFFER_BIT);
				programShadowCubeMap.use();
				gl.uniform3fv(programShadowCubeMap.getUniformLocation('u_LightPos'), light.position);
				gl.uniform1f(programShadowCubeMap.getUniformLocation('u_FarPlane'), light.range);
				let lightSpaceMatrix = computePointLightSpaceMatrix(light, face);
				gl.uniformMatrix4fv(programShadowCubeMap.getUniformLocation('pvMat'), false, lightSpaceMatrix);
				// Render the scene from the light's perspective
				if (currentSceneIndex < scenes.length) {
					scenes[currentSceneIndex].renderShadow(programShadowCubeMap);
				}
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	});
}

function resetTextureUnits(maxUnits) {
	for (let i = 0; i < maxUnits; i++) {
		gl.activeTexture(gl.TEXTURE0 + i);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
		// If you use other texture types, unbind them as well
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
		gl.bindTexture(gl.TEXTURE_3D, null);
	}
}

function render() {

	// Shadow Pass
	if (currentSceneIndex < scenes.length && scenes[currentSceneIndex].lightManager) {
		renderShadowPass(scenes[currentSceneIndex].lightManager);
	}
	if (currentSceneIndex < scenes.length) {
		currentCamera = isDebugCameraOn ? debugCamera : scenes[currentSceneIndex].getCamera();
	}

	//resetTextureUnits(maxTextureUnits);
	// Render To G Buffer
	gl.bindFramebuffer(gl.FRAMEBUFFER, gBuffer.fbo);
	const drawBuffers = [
		gl.COLOR_ATTACHMENT0, // color
		gl.COLOR_ATTACHMENT1, // emission
		gl.COLOR_ATTACHMENT2, // normals
		gl.COLOR_ATTACHMENT3 // object ID
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

	let textures = [];

	//Fog
	if (postProcessingSettings.enableFog) {
		const myfogTexture = fog.apply(gBuffer.colorTexture, gBuffer.depthTexture);
		textures.push(myfogTexture);
	}
	else {
		textures.push(gBuffer.colorTexture);
	}

	if (postProcessingSettings.enableBloom) {
		const bloomTex = bloom.apply(gBuffer.emissionTexture);
		textures.push(bloomTex);
	}

	if (postProcessingSettings.enableOutline) {
		const outlineTex = outlines.apply(gBuffer.colorTexture, gBuffer.objectIdTexture, gBuffer.depthTexture);
		textures.push(outlineTex);
	}

	let finalTexture;
	if (textures.length >= 1) {
		finalTexture = composite.apply(textures);
	} else {
		finalTexture = gBuffer.colorTexture;
	}

	if (postProcessingSettings.debugShaow) {
		const light = scenes[currentSceneIndex].lightManager.getLight(2);
		const shadowMap = scenes[currentSceneIndex].lightManager.getShadowMapManager().getShadowMaps()[light.shadowIndex];
		finalTexture = shadowMapRender.apply(shadowMap.texture);
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
	gl.uniform1f(programFSQ.getUniformLocation("fade"), globalFade);
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

	gl.bindTexture(gl.TEXTURE_2D, depthTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
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
		gl.COLOR_ATTACHMENT3 // object ID
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
