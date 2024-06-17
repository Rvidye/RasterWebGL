"use strict"

const TextureMacros = {
	Diffuse: 1,
	Specular: 2,
    Emissive: 4
};

class dmodel {
	constructor() {
		this.meshes = [];
        this.materials = [];
        this.nodes = [];
		this.animator = [];
		this.isInit = false;
        this.skin = false;
        this.rootNode = null;
        this.boneInfoMap = [];
		this.boneCounter = 0;
	}

    addAnimation(animation) {
        this.animator.push(animation);
    }

    updateAnimations(index,deltaTime) {
        if(index < this.animator.length){
            this.animator[index].update(deltaTime);
            this.animator[index].calculateTransforms();
        }else {
            console.error("Invalid Animation Index : ${index}");
        }
    }
}

class dmesh {
	constructor(vao, count, materialIndex, meshID) {
		this.vao = vao;
		this.count = count;
        this.materialIndex = materialIndex;
        this.meshID = meshID;
	}
}

class dmaterial{
    constructor(diffuseColor,emissiveColor,opacity,diffuseTextures,emissiveTexture){
        this.diffuseColor = diffuseColor;
        this.emissiveColor = emissiveColor;
        this.opacity = opacity;
        this.diffuseTextures = diffuseTextures;
        this.emissiveTexture = emissiveTexture;
    }
}

class dnodedata {
	constructor() {
		this.name = "";
		this.transformation = mat4.create();
        this.globalTransform = mat4.create();
		this.children = [];
        this.meshIndices = [];
        this.positionkeys = [];
        this.rotationkeys = [];
        this.scalingkeys = [];
	}
}

class BaseAnimation {
    constructor(duration, ticksPerSecond) {
        this.currentTime = 0.0;
        this.duration = duration;
        this.ticksPerSecond = ticksPerSecond;
    }

    update(deltaTime) {
        this.currentTime += this.ticksPerSecond * deltaTime;
        this.currentTime = this.currentTime % this.duration;
    }

    calculateTransforms() {
        // To be overridden by subclasses
    }
}

class NodeAnimation extends BaseAnimation {
    constructor(duration, ticksPerSecond, rootNode) {
        super(duration, ticksPerSecond);
        this.rootNode = rootNode;
    }

    calculateTransforms(parentTransform = mat4.create()) {
        calculateNodeTransform(this, this.rootNode, parentTransform);
    }
}

class SkeletonAnimation extends BaseAnimation {
    constructor(duration, ticksPerSecond, boneInfoMap, rootNode) {
        super(duration, ticksPerSecond);
        this.bones = [];
        this.boneInfoMap = boneInfoMap;
        this.rootNode = rootNode;
        this.finalBoneMatrices = Array(100).fill().map(() => mat4.create());
    }

    calculateTransforms(parentTransform = mat4.create()) {
        calculateBoneTransform(this, this.rootNode, parentTransform);
    }
}

class dkeyposition {
	constructor(translate, timeStamp) {
		this.translate = vec3.create();
		vec3.set(this.translate, translate[0], translate[1], translate[2]);
		this.timeStamp = timeStamp;
	}
}
class dkeyrotation {
	constructor(rotate, timeStamp) {
		this.rotate = quat.create();
		quat.set(this.rotate, rotate[1], rotate[2], rotate[3], rotate[0]);
		quat.normalize(this.rotate, this.rotate);
		this.timeStamp = timeStamp;
	}
}
class dkeyscaling {
	constructor(scale, timeStamp) {
		this.scale = vec3.create();
		vec3.set(this.scale, scale[0], scale[1], scale[2]);
		this.timeStamp = timeStamp;
	}
}

class dboneinfo {
	constructor(id, offsetMatrix) {
		this.id = id;
		this.offsetMatrix = offsetMatrix;
	}
}

class dbone {
	constructor(id, name, localTransform) {
        this.id = id;
        this.name = name;
        this.transform = localTransform;
        this.positionkeys = [];
        this.rotationkeys = [];
        this.scalingkeys = [];
        this.localTransform = mat4.create();
	}
}


var loadedTexturesForModelLoading = {}

// Helper function for binding and buffering data
function bindAndBufferData(gl, buffer, data, attribLocation, size, type = gl.FLOAT) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attribLocation);
    if (type === gl.INT) {
        gl.vertexAttribIPointer(attribLocation, size, type, 0, 0);
    } else {
        gl.vertexAttribPointer(attribLocation, size, type, false, 0, 0);
    }
}

function loadMaterial(material, directory, type, flipTexture) {
	var texturesArray = [];
	for(var i = 0; i < material.length; i++) {
		if(material[i].key != undefined && material[i].key === "$tex.file" && material[i].semantic === type) {
			var texFile = directory + '/' + material[i].value;
			if(loadedTexturesForModelLoading[texFile] == undefined) {
				loadedTexturesForModelLoading[texFile] = loadTexture(texFile, flipTexture);
			}
			texturesArray.push(loadedTexturesForModelLoading[texFile]);
		}
	}
	return texturesArray;
}

function findNodeByName(node, name) {
    if (node.name === name) {
        return node;
    }

    for (let i = 0; i < node.children.length; i++) {
        const found = findNodeByName(node.children[i], name);
        if (found) {
            return found;
        }
    }

    return null;
}

function getScaleFactor(lastTimeStamp, nextTimeStamp, animationTime) {
	var scaleFactor = 0.0;
	var midWayLength = animationTime - lastTimeStamp;
	var framesDiff = nextTimeStamp - lastTimeStamp;
	scaleFactor = midWayLength / framesDiff;
	return scaleFactor;
}

function interpolateKeyframes(keys, time, isQuat) {
    if (keys.length === 1) {
        return isQuat ? quat.clone(keys[0].rotate) : vec3.clone(keys[0].translate || keys[0].scale);
    }

    let p0Index = -1;
    for (p0Index = 0; p0Index < keys.length - 1; ++p0Index) {
        if (time < keys[p0Index + 1].timeStamp) {
            break;
        }
    }
    if (p0Index === keys.length - 1) {
        return isQuat ? quat.clone(keys[p0Index].rotate) : vec3.clone(keys[p0Index].translate || keys[p0Index].scale);
    }

    const p1Index = p0Index + 1;
    const scaleFactor = getScaleFactor(keys[p0Index].timeStamp, keys[p1Index].timeStamp, time);

    if (isQuat) {
        const result = quat.create();
        quat.slerp(result, keys[p0Index].rotate, keys[p1Index].rotate, scaleFactor);
        return result;
    } else {
        const result = vec3.create();
        vec3.lerp(result, keys[p0Index].translate || keys[p0Index].scale, keys[p1Index].translate || keys[p1Index].scale, scaleFactor);
        return result;
    }
}

function readHierarchyData(dest, src) {
	dest.name = src.name;
	var transformMat = mat4.create();
	mat4.transpose(transformMat, src.transformation);
	dest.transformation = transformMat;
	for (var i = 0; src.children != undefined && i < src.children.length; i++) {
		var newData = new dnodedata();
		readHierarchyData(newData, src.children[i]);
		dest.children.push(newData);
	}
}

function setupModel(modelName, skin = false){
    var model = modelList.find(o => o.name === modelName);
	if(model === undefined || model.json === undefined) {
		console.error("Failed: Couldn't find ${modelName}");
		return undefined;
	}
	var modelObj = new dmodel();
    modelObj.skin = skin;
	setupMesh(modelObj, model.json, skin);
    setupMaterial(modelObj, model.json, model.directory, model.flipTex);
    setupNodes(modelObj,model.json);
    if(skin)
    {
        setupSkeletonAnimation(modelObj,model.json);
    }
    else
    {
        setupNodeAnimation(modelObj,model.json);
    }
	return modelObj;
}

function setupMesh(model, json, skin)
{
    json.meshes.forEach(mesh => {
        const VAO = gl.createVertexArray();
        const VBO = gl.createBuffer();
        const VBONormal = gl.createBuffer();
        const VBOTexCoord = gl.createBuffer();
        const EBO = gl.createBuffer();

        const vertexArray = new Float32Array(mesh.vertices);
        var normalArray;
        var texCoordArray;
        const faceArray = new Uint16Array(mesh.faces.flat());

        if(mesh.normals){
            normalArray = new Float32Array(mesh.normals); 
        }

        if(mesh.texturecoords){
            texCoordArray = new Float32Array(mesh.texturecoords[0]);
        }

        // Bind and buffer data
        gl.bindVertexArray(VAO);
        bindAndBufferData(gl, VBO, vertexArray, 0, 3);
        if(normalArray)
            bindAndBufferData(gl, VBONormal, normalArray, 1, 3);
        else
            gl.disableVertexAttribArray(1);

        if(texCoordArray)
            bindAndBufferData(gl, VBOTexCoord, texCoordArray, 2, 2);
        else
            gl.disableVertexAttribArray(2);
        if(skin)
        {
            const VBOBone = gl.createBuffer();
            const VBOWeight = gl.createBuffer();
            const boneIdsArray = new Int32Array(mesh.vertices.length / 3 * 4);
            for(var j = 0; j < boneIdsArray.length; j++) {
                boneIdsArray[j] = -1;
            }
            const weightArray = new Float32Array(mesh.vertices.length / 3 * 4);
            for (var boneIndex = 0; mesh.bones != undefined && boneIndex < mesh.bones.length; boneIndex++) {
                var boneID = -1;
                var boneName = mesh.bones[boneIndex].name;
                if (model.boneInfoMap[boneName] == undefined) {
                    var offsetmatrix = mat4.create();
                    mat4.transpose(offsetmatrix, mesh.bones[boneIndex].offsetmatrix);
                    var newBoneInfo = new dboneinfo(model.boneCounter, offsetmatrix);
                    model.boneInfoMap[boneName] = newBoneInfo;
                    boneID = model.boneCounter;
                    model.boneCounter++;
                } else {
                    boneID = model.boneInfoMap[boneName].id;
                }
                var weights = mesh.bones[boneIndex].weights;
                for(var weightIndex = 0; weightIndex < weights.length; ++weightIndex) {
                    var vertexId = weights[weightIndex][0];
                    var weight = weights[weightIndex][1];
                    for(var k = 0; k < 4; ++k) {
                        if (boneIdsArray[vertexId * 4 + k] < 0) {
                            weightArray[vertexId * 4 + k] = weight;
                            boneIdsArray[vertexId * 4 + k] = boneID;
                            break;
                        }
                    }
                }
            }
            bindAndBufferData(gl, VBOBone, boneIdsArray, 3, 4, gl.INT);
            bindAndBufferData(gl, VBOWeight, weightArray, 4, 4);
        }else
        {
            gl.enableVertexAttribArray(3);
            gl.vertexAttribIPointer(3, 4, gl.INT, 0, 0);
            gl.enableVertexAttribArray(4);
            gl.vertexAttribPointer(4, 4, gl.FLOAT, false, 0, 0);
            //gl.disableVertexAttribArray(3);
            //gl.disableVertexAttribArray(4);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, EBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, faceArray, gl.STATIC_DRAW);
        gl.bindVertexArray(null);
        model.meshes.push(new dmesh(VAO,faceArray.length,mesh.materialindex,vec4.fromValues(getRandomInRange(0.0,1.0),getRandomInRange(0.0,1.0),getRandomInRange(0.0,1.0),1.0)));
    });
}

function setupMaterial(modelObj,json,directory,isFlipTexture)
{
    const usedMaterialIndices = new Set();
    json.meshes.forEach(mesh => {
        usedMaterialIndices.add(mesh.materialindex);
    });

    usedMaterialIndices.forEach(materialindex => {
        const mat = json.materials[materialindex];
        let diffuseColor = vec3.fromValues(1.0, 1.0, 1.0);
        let emissiveColor = vec3.fromValues(0.0, 0.0, 0.0);
        let opacity = 1.0;
        var diffuseTextures;
        var emissiveTextures;

        mat.properties.forEach(prop =>{
            switch (prop.key) {
                case "$clr.diffuse":
                    vec3.set(diffuseColor, prop.value[0], prop.value[1], prop.value[2]);
                break;
                case "$clr.emissive":
                    vec3.set(emissiveColor, prop.value[0], prop.value[1], prop.value[2]);
                break;
                case "$mat.opacity":
                    opacity = prop.value;
                break;
                case "$tex.file":
                    if (prop.semantic === TextureMacros.Diffuse) {
                        const texFile = directory + '/' + prop.value;
                        if (!loadedTexturesForModelLoading[texFile]) {
                            loadedTexturesForModelLoading[texFile] = loadTexture(texFile, isFlipTexture);
                        }
                        diffuseTextures = loadedTexturesForModelLoading[texFile];
                    } else if (prop.semantic === TextureMacros.Emissive) {
                        const texFile = directory + '/' + prop.value;
                        if (!loadedTexturesForModelLoading[texFile]) {
                            loadedTexturesForModelLoading[texFile] = loadTexture(texFile, isFlipTexture);
                        }
                        emissiveTextures = loadedTexturesForModelLoading[texFile];
                    }
                break;
            }
        });
        modelObj.materials.push(new dmaterial(diffuseColor,emissiveColor,opacity,diffuseTextures,emissiveTextures));
    });
}
// this should never be called
// function setupAnimation(modelObj, json){
//     json.animations.forEach((anim) => {
//     const animation = new danimator(anim.duration, anim.tickspersecond, modelObj.rootNode);

//     anim.channels.forEach((channel) => {
//         const node = findNodeByName(modelObj.rootNode, channel.name);
//         if (node) {
//             channel.positionkeys.forEach((key) => {
//                 node.positionkeys.push(new dkeyposition(key[1], key[0]));
//             });
//             channel.rotationkeys.forEach((key) => {
//                 node.rotationkeys.push(new dkeyrotation(key[1], key[0]));
//             });
//             channel.scalingkeys.forEach((key) => {
//                 node.scalingkeys.push(new dkeyscaling(key[1], key[0]));
//             });
//         }
//     });
//     modelObj.animator.push(animation);
//     });
// }

function setupNodeAnimation(modelObj, json) {
    if(json.animations === undefined)
        return;
    json.animations.forEach(anim => {
        const animation = new NodeAnimation(anim.duration, anim.tickspersecond, modelObj.rootNode);

        anim.channels.forEach(channel => {
            const node = findNodeByName(modelObj.rootNode, channel.name);
            if (node) {
                channel.positionkeys.forEach(key => {
                    node.positionkeys.push(new dkeyposition(key[1], key[0]));
                });
                channel.rotationkeys.forEach(key => {
                    node.rotationkeys.push(new dkeyrotation(key[1], key[0]));
                });
                channel.scalingkeys.forEach(key => {
                    node.scalingkeys.push(new dkeyscaling(key[1], key[0]));
                });
            }
        });
        modelObj.addAnimation(animation);
    });
}

function setupSkeletonAnimation(modelObj, json) {
    for (var i = 0; json.animations != undefined && i < json.animations.length; i++) {
        var animation = json.animations[i];
        var globalTransform = mat4.create();
        mat4.transpose(globalTransform, json.rootnode.transformation);
        mat4.invert(globalTransform, globalTransform);
        var rootNode = new dnodedata();
        readHierarchyData(rootNode, json.rootnode);

        var animator = new SkeletonAnimation(animation.duration, animation.tickspersecond, modelObj.boneInfoMap, rootNode);
        for (var j = 0; animation.channels != undefined && j < animation.channels.length; j++) {
            var channel = animation.channels[j];
            var boneName = channel.name;

            if (modelObj.boneInfoMap[boneName] == undefined) {
                var off = mat4.create();
                var boneInfo = new dboneinfo(modelObj.boneCounter, off);
                modelObj.boneInfoMap[boneName] = boneInfo;
                modelObj.boneCounter++;
            }
            var bone = new dbone(modelObj.boneInfoMap[channel.name].id, channel.name, mat4.create());
            for (var positionIndex = 0; channel.positionkeys != undefined && positionIndex < channel.positionkeys.length; ++positionIndex) {
                var key = new dkeyposition(channel.positionkeys[positionIndex][1], channel.positionkeys[positionIndex][0]);
                bone.positionkeys.push(key);
            }

            for (var rotationIndex = 0; channel.rotationkeys != undefined && rotationIndex < channel.rotationkeys.length; ++rotationIndex) {
                var key = new dkeyrotation(channel.rotationkeys[rotationIndex][1], channel.rotationkeys[rotationIndex][0]);
                bone.rotationkeys.push(key);
            }

            for (var scalingIndex = 0; channel.scalingkeys != undefined && scalingIndex < channel.scalingkeys.length; ++scalingIndex) {
                var key = new dkeyscaling(channel.scalingkeys[scalingIndex][1], channel.scalingkeys[scalingIndex][0]);
                bone.scalingkeys.push(key);
            }
            animator.bones.push(bone);
        }
        modelObj.animator.push(animator);
    }
}

function setupNodes(modelObj,json){
    function recursiveLoadNodes(nodeData) {
        const node = new dnodedata();
        node.name = nodeData.name;
        node.transformation = mat4.clone(nodeData.transformation);
        nodeData.meshes?.forEach((meshIndex) => {
            node.meshIndices.push(meshIndex);
        });
        nodeData.children?.forEach((child) => {
            node.children.push(recursiveLoadNodes(child));
        });
        modelObj.nodes.push(node);
        return node;
    }
    modelObj.rootNode = recursiveLoadNodes(json.rootnode);
}

function calculateNodeTransform(animator, node, parentTransform) {
    let nodeTransform = mat4.clone(node.transformation);

    // Interpolate Translation
    if (node.positionkeys.length > 0) {
        const translation = interpolateKeyframes(node.positionkeys, animator.currentTime);
        mat4.translate(nodeTransform, nodeTransform, translation);
    }

    // Interpolate Rotation
    if (node.rotationkeys.length > 0) {
        const rotation = interpolateKeyframes(node.rotationkeys, animator.currentTime, true);
        const rotationMat = mat4.create();
        mat4.fromQuat(rotationMat, rotation);
        mat4.multiply(nodeTransform, nodeTransform, rotationMat);
    }

    // Interpolate Scale
    if (node.scalingkeys.length > 0) {
        const scale = interpolateKeyframes(node.scalingkeys, animator.currentTime);
        mat4.scale(nodeTransform, nodeTransform, scale);
    }

    const globalTransformation = mat4.create();
    mat4.multiply(globalTransformation, parentTransform, nodeTransform);

    // Apply global transformation to this node
    node.globalTransform = globalTransformation;

    // Recursively apply to children
    for (let i = 0; i < node.children.length; i++) {
        calculateNodeTransform(animator, node.children[i], globalTransformation);
    }
}

function calculateBoneTransform(animator, node, parentTransform) {
    if (animator === undefined) {
        return;
    }

    var nodeName = node.name;
    var nodeTransform = node.transformation;

    var bone = animator.bones.find(o => o.name === nodeName);

    if (bone != undefined) {
        var translationMat = mat4.create();
        var rotationMat = mat4.create();
        var scalingMat = mat4.create();
        var p0Index = -1;
        var p1Index = -1;

        // Calculate Translation
        if (bone.positionkeys.length === 1) {
            mat4.translate(translationMat, translationMat, bone.positionkeys[0].translate);
        } else {
            for (p0Index = 0; p0Index < bone.positionkeys.length - 1; ++p0Index) {
                if (animator.currentTime < bone.positionkeys[p0Index + 1].timeStamp) {
                    break;
                }
            }
            if (p0Index === bone.positionkeys.length - 1) {
                mat4.translate(translationMat, translationMat, bone.positionkeys[p0Index].translate);
            } else {
                p1Index = p0Index + 1;
                var t = vec3.create();
                vec3.lerp(t, bone.positionkeys[p0Index].translate, bone.positionkeys[p1Index].translate, getScaleFactor(bone.positionkeys[p0Index].timeStamp, bone.positionkeys[p1Index].timeStamp, animator.currentTime));
                mat4.translate(translationMat, translationMat, t);
            }
        }

        // Calculate Rotation
        if (bone.rotationkeys.length === 1) {
            mat4.fromQuat(rotationMat, bone.rotationkeys[0].rotate);
        } else {
            for (p0Index = 0; p0Index < bone.rotationkeys.length - 1; ++p0Index) {
                if (animator.currentTime < bone.rotationkeys[p0Index + 1].timeStamp) {
                    break;
                }
            }
            if (p0Index === bone.rotationkeys.length - 1) {
                mat4.fromQuat(rotationMat, bone.rotationkeys[p0Index].rotate);
            } else {
                p1Index = p0Index + 1;
                var r = quat.create();
                quat.slerp(r, bone.rotationkeys[p0Index].rotate, bone.rotationkeys[p1Index].rotate, getScaleFactor(bone.rotationkeys[p0Index].timeStamp, bone.rotationkeys[p1Index].timeStamp, animator.currentTime));
                mat4.fromQuat(rotationMat, bone.rotationkeys[p0Index].rotate);
                mat4.fromQuat(rotationMat, r);
            }
        }

        // Calculate Scale
        if (bone.scalingkeys.length === 1) {
            mat4.scale(scalingMat, scalingMat, bone.scalingkeys[0].scale);
        } else {
            for (p0Index = 0; p0Index < bone.scalingkeys.length - 1; ++p0Index) {
                if (animator.currentTime < bone.scalingkeys[p0Index + 1].timeStamp) {
                    break;
                }
            }
            if (p0Index === bone.scalingkeys.length - 1) {
                mat4.scale(scalingMat, scalingMat, bone.scalingkeys[p0Index].scale);
            } else {
                p1Index = p0Index + 1;
                var s = vec3.create();
                vec3.lerp(s, bone.scalingkeys[p0Index].scale, bone.scalingkeys[p1Index].scale, getScaleFactor(bone.scalingkeys[p0Index].timeStamp, bone.scalingkeys[p1Index].timeStamp, animator.currentTime));
                mat4.scale(scalingMat, scalingMat, s);
            }
        }

        var tempMat = mat4.create();
        mat4.multiply(tempMat, translationMat, rotationMat);
        mat4.multiply(tempMat, tempMat, scalingMat);
        bone.localTransform = tempMat;
        nodeTransform = bone.localTransform;
    }

    var globalTransformation = mat4.create();
    mat4.multiply(globalTransformation, parentTransform, nodeTransform);

    var boneInfoMap = animator.boneInfoMap;
    if (boneInfoMap[nodeName] != undefined) {
        var index = boneInfoMap[nodeName].id;
        var offset = boneInfoMap[nodeName].offsetMatrix;
        mat4.multiply(animator.finalBoneMatrices[index], globalTransformation, offset);
    }

    for (var i = 0; i < node.children.length; i++) {
        calculateBoneTransform(animator, node.children[i], globalTransformation);
    }
}

function uploadBoneMatrices(model,program,index) {
    if (model.animator[index] === undefined) {
        console.error(`Invalid animator index: ${index}`);
        return;
    }
    // This is a bit hacky but seems to work for now
    // Ensure that boneMatrices is a 2D array where each entry is a 4x4 matrix
    const flattenedMatrices = new Float32Array(model.animator[index].finalBoneMatrices.length * 16);    
    for (let i = 0; i < model.animator[index].finalBoneMatrices.length; i++) {
        flattenedMatrices.set(model.animator[index].finalBoneMatrices[i], i * 16);
    }
    gl.uniformMatrix4fv(gl.getUniformLocation(program.programObject, "bMat"), false, new Float32Array(flattenedMatrices));
}

function updateModel(model, i, delta) {
    if(model === undefined) {
		return;
	}
    model.updateAnimations(i,delta);
}

function renderModel(model, program, useMaterial, drawOutline = false) {
    function recursiveRenderNode(node, parentTransform) {
        const globalTransform = mat4.create();
        mat4.multiply(globalTransform, parentTransform, node.globalTransform);

        node.meshIndices.forEach((meshIndex) => {
            const mesh = model.meshes[meshIndex];
            const material = model.materials[mesh.materialIndex];
            
            if(useMaterial){
                gl.uniform3fv(program.getUniformLocation("material.diffuse"), material.diffuseColor);
                gl.uniform3fv(program.getUniformLocation("material.emissive"), material.emissiveColor);
                gl.uniform1f(program.getUniformLocation("material.opacity"), material.opacity);
                if (material.diffuseTextures != undefined) {
                    gl.uniform1i(program.getUniformLocation("useTexture"),true);
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, material.diffuseTextures);
                    gl.uniform1i(program.getUniformLocation("samplerDiffuse"), 0);
                }
                else{
                    gl.uniform1i(program.getUniformLocation("useTexture"),false);
                }
            }

            gl.uniformMatrix4fv(program.getUniformLocation("nMat"), false, globalTransform);
            if(drawOutline) 
                gl.uniform4fv(program.getUniformLocation("objectID"),mesh.meshID);
            else 
                gl.uniform4fv(program.getUniformLocation("objectID"),[0.0,0.0,0.0,0.0]);
            gl.uniform1i(program.getUniformLocation("useSkinning"),model.skin);
            gl.bindVertexArray(mesh.vao);
            gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);

            if(useMaterial){
                if (material.diffuseTextures != undefined) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
            }
        });

        node.children.forEach((child) => {
            recursiveRenderNode(child, globalTransform);
        });
    }
    recursiveRenderNode(model.rootNode, mat4.create());
}