"use strict"

var loadedTextures = {}
var modelList = [
	{ name: "test2", files:[ 'models/cube.glb'], flipTex:true },
]

var scenes = [];
var currentSceneIndex = 0;
var modelLoader;
var debugCamera;

assimpjs().then (function (ajs) {
	if(true) {
		Promise.all(modelList.flatMap(o => o.files).map((fileToLoad) => fetch (fileToLoad))).then ((responses) => {
			return Promise.all(responses.map ((res) => res.arrayBuffer()))
		}).then((arrayBuffers) => {
			var k = 0
			for(var i = 0; i < modelList.length; i++) {
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
			}
			main();
		})
	} else {
		main()
	}
});

function main(){

    canvas = document.createElement("canvas");
    gl = canvas.getContext("webgl2");
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

    gl.clearColor(0.0, 0.0, 1.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

	modelLoader = new MinimalGLTFLoader.glTFLoader(gl);
	modelLoader.loadGLTF("https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF/DamagedHelmet.gltf",function(glTF) {
		console.log(glTF);
	});
	debugCamera = new DebugCamera();
	currentCamera = debugCamera;

	// scene setup

	addScene(new tutorial());
	initScenes();

    window.requestAnimationFrame(renderFrame);
}

function onMyResize(){
    console.log("In Resize");
    canvas.width = window.innerWidth;
    canvas.height =  window.innerHeight;
    gl.viewport(0,0,canvas.width,canvas.height);
	debugCamera.resizeCamera(window.innerWidth, window.innerHeight);
}

function onMyKeyPress(event){
    console.log("In Keypress");
    if(event.code == "KeyF")
    {
        canvas.requestFullscreen();
    }
	debugCamera.keyboard(event);
	scenes[currentSceneIndex].keyboardfunc(event.code);
}

function onMyMouseDown(event){
    console.log("In Down");
}

function onMyMouseMove(event){
    console.log("In Move");
}

function onMyMouseUp(event){
    console.log("In Up");
}

function onClose(event){
    console.log("In Close");
}

// Scene related Functions

function addScene(scene)
{
	if (scene instanceof Scene) {
        scenes.push(scene);
    } else {
        throw new Error("Added scene must be an instance of SceneBase");
    }
}

function initScenes(){
	scenes.forEach(scene =>{
		scene.setupProgram();
		scene.setupCamera();
		scene.init();
	});
}


// just wanted something similar to rendering loop in OpenGL/Win32
function renderFrame(timeStamp)
{
	GLOBAL.deltaTime = (timeStamp - GLOBAL.lastFrameTime) * 0.001;
	GLOBAL.lastFrameTime = timeStamp;
	//console.log("Rendering frame with delta time:", GLOBAL.deltaTime);

	render();
	update();
	requestAnimationFrame(renderFrame);
}

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	if(currentSceneIndex < scenes.length){
		scenes[currentSceneIndex].render();
	}
}

function update()
{
	if(currentSceneIndex < scenes.length){
		const currentScene = scenes[currentSceneIndex];
		if(currentScene.isCompleted())
		{
			if(currentSceneIndex <= scenes.length)
			{
				currentSceneIndex++;
				if(currentSceneIndex == scenes.length)
				{
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
	if(loadedTextures[path] == undefined) {
		var tbo = gl.createTexture()
		tbo.image = new Image()
		tbo.image.src = path
		console.log("Loading: " + path)
		tbo.image.onload = function() {
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
		tbo.image.onerror = function() {
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
		{ bind: gl.TEXTURE_CUBE_MAP_POSITIVE_X, name: "px" + ext},
		{ bind: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, name: "nx" + ext},
		{ bind: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, name: "py" + ext},
		{ bind: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, name: "ny" + ext},
		{ bind: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, name: "pz" + ext},
		{ bind: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, name: "nz" + ext},
	]
	var imageData = [ null, null, null, null, null, null]
	imageData[0] = new Image()
	imageData[0].src = apath + "/" + cubemapFaces[0].name
	imageData[0].tname = cubemapFaces[0].name
	imageData[0].bind = cubemapFaces[0].bind
	imageData[0].onload = function() {
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
	imageData[1].onload = function() {
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
	imageData[2].onload = function() {
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
	imageData[3].onload = function() {
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
	imageData[4].onload = function() {
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
	imageData[5].onload = function() {
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
