"use strict"

var ElephantScene = {
    modelPlacer: null,
    sceneCamera: null,
    sceneCameraRig: null,
    programCelShader: null,
    timer: null,
    songStart: 0,
    cubPath: null,
    cubPathRig: null
};

const ElephantSceneEventIDS = {
    START_T: 0,
    MOVE_T: 1,
    MOVE_ELEPHANT_MOTHER_1: 2,
    MOVE_ELEPHANT_BABY_1: 3,
    MOVE_ELEPHANT_BABY_2: 4,
    MOVE_ELEPHANT_BABY_3: 5,
    MOVE_ELEPHANT_MOTHER_2: 6,
    END_T: 7,
    SUN_T: 8
};

var sunAngle = 0.0;

class elephantScene extends Scene {

    constructor() {
        super();
        this.isComplete = false;
    }

    setupProgram() {
        ElephantScene.programCelShader = new ShaderProgram(gl, ['shaders/model/model.vert', 'shaders/model/celShader.frag']);
    }

    setupCamera() {

        // Setup All Cameras here
        // Setup All Cameras here
        const positionKeyFrames = [

            [43.59999999999953, 12.599999999999959, 121.8999999999989],
            [-33.30000000000052, 12.599999999999959, 119.00000000000037],
            [-103.60000000000036, 14.199999999999864, 74.8000000000007],
            [-176.50000000000026, 17.39999999999968, 61.30000000000005],
            [-181.3999999999993, 21.299999999999578, 90.89999999999971],
            [-161.3999999999996, 24.699999999999513, 47.69999999999957],
            [-92.60000000000073, 27.49999999999961, 53.19999999999935],
            [27.199999999999164,68.20000000000105,17.6999999999993],
            [-1.9000000000007597, 75.19999999999953, -87.50000000000037],
            [-136.70000000000047, 46.899999999999594, -183.5999999999994],
            [-170.09999999999977, 25.099999999999778, -124.39999999999975],
            [-117.49999999999974,15.499999999999963,-93.29999999999991],
        ];

        const frontKeyFrames = [

            [149.39999999999918, 12.299999999999969, 131.99999999999935],
            [6.199999999999557, 12.599999999999959, 121.2000000000005],
            [-68.3000000000005, 11.499999999999774, 117.70000000000019],
            [-119.10000000000056, 11.099999999999556, 89.89999999999995],
            [-134.4000000000005, 14.699999999999626, 141.69999999999962],
            [-136.90000000000057, 13.09999999999959, 107.19999999999952],
            [-136.90000000000046, 12.099999999999532, 85.79999999999949],
            [-150.30000000000038, 12.799999999999523, 35.699999999999875],
            [-158.5000000000003, 11.899999999999558, -3.0999999999999583],
            [-158.6999999999999, 8.999999999999858, -32.100000000000016],
            [-149.49999999999957, 7, -56.40000000000004],
            [-129.39999999999972, 8.29999999999999, -60.800000000000104],
        ];

        ElephantScene.sceneCamera = new SceneCamera(positionKeyFrames, frontKeyFrames);
        ElephantScene.sceneCameraRig = new SceneCameraRig(ElephantScene.sceneCamera);
        ElephantScene.sceneCameraRig.setRenderFront(true);
        ElephantScene.sceneCameraRig.setRenderFrontPoints(true);
        ElephantScene.sceneCameraRig.setRenderPath(true);
        ElephantScene.sceneCameraRig.setRenderPathPoints(true);
        ElephantScene.sceneCameraRig.setRenderPathToFront(true);
        ElephantScene.sceneCameraRig.setScalingFactor(0.1);
    }

    init() {
        //Lighting Setup
        this.lightManager = new LightManager();
        const directionalLight = new Light(0, [1.0, 1.0, 1.0], 1.0, [0, 400, 400], [0.0, -1.0, -1.0], 0.0, 0.0, 0.0, false);

        //For Ambient
        const directionalLight2 = new Light(0, [1.0, 1.0, 1.0], 0.15, [0, -400, -400], [0.0, -1.0, 1.0], 0.0, 0.0, 0.0, false);
        this.lightManager.addLight(directionalLight);
        this.lightManager.addLight(directionalLight2);

        //Grass Rendering class object
        this.myGrass = new grass(1500, 1500, 1500);

        //Atmospheric Scattering Class Object
        this.myAtmScat = new atmScattering();

        //Vegetation
        this.myVegetation = new vegetation();

        //Models(Terrain,Tree,Stones)
        this.myModelDraw = new drawModels();

        //PondWater
        this.myPondWater = new pondWater();

        //Load Models
        //Terrain
        this.terrainScale = 1000.0;
        this.terrainModelName = "terrain";
        this.terrainModel = setupModel(this.terrainModelName, false);
        this.terrainModelMatrixArray = [];
        this.terrainTextue = null;

        this.whiteTexture = null;
        //Tree1
        this.tree1Model = setupModel("tree4", false);
        this.tree1ModelMatrixArray = [];
        //Tree2
        this.tree2Model = setupModel("tree5", false);
        this.tree2ModelMatrixArray = [];
        //Tree3
        this.tree3Model = setupModel("tree6", false);
        this.tree3ModelMatrixArray = [];

        //Tree Logs
        this.treeLog1Model = setupModel("treeLog1", false);
        this.treeLog1ModelMatrixArray = [];

        this.treeLog2Model = setupModel("treeLog2", false);
        this.treeLog2ModelMatrixArray = [];

        //Tree Trunks
        this.treeTrunk1Model = setupModel("treeTrunk1", false);
        this.treeTrunk1ModelMatrixArray = [];

        this.treeTrunk2Model = setupModel("treeTrunk2", false);
        this.treeTrunk2ModelMatrixArray = [];

        //Stones
        this.stone1Model = setupModel("stone1", false);
        this.stone1ModelMatrixArray = [];

        //this.elephantMother = setupModel("elephantMother", false);
        //this.elephantCub = setupModel("elephantCub", false);

        this.elephantMotherAnim = setupModel("elephantMother", true);
        console.log(this.elephantMotherAnim);
        this.elephantCubAnim = setupModel("elephantCub", true);
        console.log(this.elephantCubAnim);

        this.currentMotherAnimation = 2;
        this.currentBabyAnimation = 3;

        // Spline Path for Elephant can be done in constructor
        const motherPositions_1 = [
            [-127,1.2,217],
            [-126,0.9,163],
            [-125,0.9,145],
            [-127,0.9,120],
        ];

        this.motherPathSpline_1 = new BsplineInterpolator(motherPositions_1);
        this.splineMotherAdjuster_1 = new SplineAdjuster(this.motherPathSpline_1);
        this.splineMotherAdjuster_1.setRenderPath(true);
        this.splineMotherAdjuster_1.setRenderPathPoints(true);
        //this.splineAdjuster.setScalingFactor(0.01);

        //First Baby Movement
        const babyPositions_1 = [
            [170,0.1,136],
            [56,0.1,122],
            [-37, 0.1, 126],
            [-110, 0.1, 92],
        ];

        this.babyPathSpline_1 = new BsplineInterpolator(babyPositions_1);
        this.splineBabyAdjuster_1 = new SplineAdjuster(this.babyPathSpline_1);
        this.splineBabyAdjuster_1.setRenderPath(true);
        this.splineBabyAdjuster_1.setRenderPathPoints(true);
        //this.splineAdjuster.setScalingFactor(0.01);

        //Second Baby Movement -> only baby moves,mother standing
        const babyPositions_2 = [
            [-110, 0.1, 92],
            [-136, 0.1, 62],
            [-150, 0.1, -1],
            [-141, 0.1, -50],
        ];

        this.babyPathSpline_2 = new BsplineInterpolator(babyPositions_2);
        this.splineBabyAdjuster_2 = new SplineAdjuster(this.babyPathSpline_2);
        this.splineBabyAdjuster_2.setRenderPath(true);
        this.splineBabyAdjuster_2.setRenderPathPoints(true);
        //this.splineAdjuster.setScalingFactor(0.01);

        //Third movement->both mother and baby moves
        // Spline Path for Elephant can be done in constructor
        const motherPositions_2 = [
            [-127,0.4,120],
            [-156, 0.8, 50],
            [-164, 0.9, -1],
            [-157, 0.9, -54],
        ];

        this.motherPathSpline_2 = new BsplineInterpolator(motherPositions_2);
        this.splineMotherAdjuster_2 = new SplineAdjuster(this.motherPathSpline_2);
        this.splineMotherAdjuster_2.setRenderPath(true);
        this.splineMotherAdjuster_2.setRenderPathPoints(true);

        //Third Baby Movement
        const babyPositions_3 = [
            [-231, 0.1, -189],
            [-201, 0.1, -176],
            [-167, 0.1, -173],
            [-99, 0.1, -164],
        ];

        this.babyPathSpline_3 = new BsplineInterpolator(babyPositions_3);
        this.splineBabyAdjuster_3 = new SplineAdjuster(this.babyPathSpline_3);
        this.splineBabyAdjuster_3.setRenderPath(true);
        this.splineBabyAdjuster_3.setRenderPathPoints(true);
        //this.splineAdjuster.setScalingFactor(0.01);

        this.splineAdjuster = this.splineMotherAdjuster_2;

        //model Placer
        ElephantScene.modelPlacer = new ModelPlacer();
        ElephantScene.modelPlacer.position = vec3.fromValues(0.0, -6260.0, 0.0);
        ElephantScene.modelPlacer.rotation = vec3.fromValues(0.00, 0.00, 0.00);
        ElephantScene.modelPlacer.scale = vec3.fromValues(6420.0, 6420.0, 6420.0);

        //Timer
        ElephantScene.timer = new timer([
            [ElephantSceneEventIDS.START_T, [0.0, 1.0]],
            [ElephantSceneEventIDS.MOVE_T, [1.0, 54.0]],

            //First Movement(both)
            [ElephantSceneEventIDS.MOVE_ELEPHANT_MOTHER_1, [13.0, 12.0]],
            [ElephantSceneEventIDS.MOVE_ELEPHANT_BABY_1, [0.0, 15.0]],

            //Second Movement(only baby)
            [ElephantSceneEventIDS.MOVE_ELEPHANT_BABY_2, [30.0, 20.0]],

            //Third movement(both)
            // [ElephantSceneEventIDS.MOVE_ELEPHANT_BABY_3, [40.0, 8.0]],
            [ElephantSceneEventIDS.MOVE_ELEPHANT_MOTHER_2, [30.0, 20.0]],

            [ElephantSceneEventIDS.END_T, [55.0, 1.0]],
            [ElephantSceneEventIDS.SUN_T, [0.0, 50.0]],
        ]);

        // setup callbacks for 1 time events
        //Elephant mother movement callback
        ElephantScene.timer.registerCallback(14.0, () => { this.currentBabyAnimation = 0 }); //Failing
        ElephantScene.timer.registerCallback(16.0, () => { this.currentBabyAnimation = 1 }); //standing head movement
        ElephantScene.timer.registerCallback(25.0, () => { this.currentBabyAnimation = 2 }); //Playing

        ElephantScene.timer.registerCallback(30.0, () => { this.currentBabyAnimation = 3 }); //Walking
        ElephantScene.timer.registerCallback(50.0, () => { this.currentBabyAnimation = 1 }); //Walking



        ElephantScene.timer.registerCallback(13.0, () => { this.currentMotherAnimation = 2 }); //walking
        ElephantScene.timer.registerCallback(25.0, () => { this.currentMotherAnimation = 0 }); //standing

        ElephantScene.timer.registerCallback(30.0, () => { this.currentMotherAnimation = 2 }); //Walking
        ElephantScene.timer.registerCallback(50.0, () => { this.currentMotherAnimation = 0 }); //standing


        //Setup Grass and other models Position Acoording To Terrain 
        let model = modelList.find(o => o.name === this.terrainModelName);
        let mesh = model.json.meshes[0];
        let data = new Float32Array(mesh.vertices);
        let j = 0;


        const grassBladesPos = [];
        let vegetationPosMatrix = [];
        this.treePositions = [];

        for (let i = 0; i < data.length; i += 3) {
            if ((Math.abs(data[i]) > Math.random() * 0.05 + 0.19 || Math.abs(data[i + 2]) > Math.random() * 0.05 + 0.15) && data[i + 1] == 0.0) {
                //Grass Blades Position
                for (let k = 0; k < 200.0; k++) {
                    j++;
                    let fAngle = Math.random() * 2 * Math.PI;
                    let r = Math.random() * 20.0 + 0.5;
                    grassBladesPos.push(data[i] * this.terrainScale * 2.0 + r * Math.cos(fAngle));
                    grassBladesPos.push(data[i + 1] * this.terrainScale * 2.0);
                    grassBladesPos.push(data[i + 2] * this.terrainScale * 2.0 + r * Math.sin(fAngle));
                }
                // //Vegetation position
                // if (Math.random() < 0.1) {
                //     let tempMat = mat4.create();
                //     mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                //     vegetationPosMatrix.push(tempMat);
                // }
            }
            /*
            //Tree models
            //For Models Setting modelMatrices
            if ((Math.abs(data[i]) > Math.random() * 0.01 + 0.19 || Math.abs(data[i + 2]) > Math.random() * 0.01 + 0.15)) {

                let randomFact = data[i + 1] > 1.0 ? 0.1 : 0.03;
                let randomLogFact = 0.005;
                let randomTrunkFact = 0.005;

                //Big Tree
                if (Math.random() < randomFact) {
                    let x = data[i] * this.terrainScale;
                    let y = data[i + 1] * this.terrainScale;
                    let z = data[i + 2] * this.terrainScale;
                    if (!this.isTooClose(x, y, z)) {
                        let tempMat = mat4.create();
                        mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                        mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                        let scaleFactor = Math.random() * 2.5 + 3.0;
                        mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                        this.tree1ModelMatrixArray.push(tempMat);
                        this.treePositions.push([x, y, z]);
                    }
                }
                else if (Math.random() < randomFact) {
                    //Medium Tree
                    let x = data[i] * this.terrainScale;
                    let y = data[i + 1] * this.terrainScale;
                    let z = data[i + 2] * this.terrainScale;
                    if (!this.isTooClose(x, y, z)) {
                    let tempMat = mat4.create();
                    mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                    mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                    let scaleFactor = Math.random() * 2.5 + 3.0;
                    mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                    this.tree2ModelMatrixArray.push(tempMat);
                    this.treePositions.push([x, y, z]);
                    }
                } else if (Math.random() < randomFact) {
                    //Small Tree
                    let x = data[i] * this.terrainScale;
                    let y = data[i + 1] * this.terrainScale;
                    let z = data[i + 2] * this.terrainScale;
                    if (!this.isTooClose(x, y, z)) {
                    let tempMat = mat4.create();
                    mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                    mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                    let scaleFactor = Math.random() * 2.5 + 2.5;
                    mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                    this.tree3ModelMatrixArray.push(tempMat);
                    this.treePositions.push([x, y, z]);
                    }
                } //else if (Math.random() < randomLogFact) {
                //     //Big Log
                //     //Small Tree
                //     let x = data[i] * this.terrainScale;
                //     let y = data[i + 1] * this.terrainScale;
                //     let z = data[i + 2] * this.terrainScale;
                //     if (!this.isTooClose(x, y, z)) {
                //     let tempMat = mat4.create();
                //     mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                //     mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                //     let scaleFactor = Math.random() * 2.5 + 2.0;
                //     mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                //     this.treeLog1ModelMatrixArray.push(tempMat);
                //     this.treePositions.push([x, y, z]);
                //     }
                // } else if (Math.random() < randomLogFact) {
                //     //Medium Log
                //     let x = data[i] * this.terrainScale;
                //     let y = data[i + 1] * this.terrainScale;
                //     let z = data[i + 2] * this.terrainScale;
                //     if (!this.isTooClose(x, y, z)) {
                //     let tempMat = mat4.create();
                //     mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                //     mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                //     let scaleFactor = Math.random() * 2.5 + 2.0;
                //     mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                //     this.treeLog2ModelMatrixArray.push(tempMat);
                //     this.treePositions.push([x, y, z]);
                //     }
                // }
                // else if (Math.random() < randomTrunkFact) {
                //     //Big Trunk
                //     let x = data[i] * this.terrainScale;
                //     let y = data[i + 1] * this.terrainScale;
                //     let z = data[i + 2] * this.terrainScale;
                //     if (!this.isTooClose(x, y, z)) {
                //     let tempMat = mat4.create();
                //     mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                //     mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                //     let scaleFactor = Math.random() * 2.5 + 2.0;
                //     mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                //     this.treeTrunk1ModelMatrixArray.push(tempMat);
                //     this.treePositions.push([x, y, z]);
                //     }
                // } else if (Math.random() < randomTrunkFact) {
                //     //Medium Trunk
                //     let x = data[i] * this.terrainScale;
                //     let y = data[i + 1] * this.terrainScale;
                //     let z = data[i + 2] * this.terrainScale;
                //     if (!this.isTooClose(x, y, z)) {
                //     let tempMat = mat4.create();
                //     mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
                //     mat4.rotateY(tempMat, tempMat, Math.random() * 2 * Math.PI);
                //     let scaleFactor = Math.random() * 2.5 + 2.0;
                //     mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
                //     this.treeTrunk2ModelMatrixArray.push(tempMat);
                //     this.treePositions.push([x, y, z]);
                //     }
                // }
            }
            //Under Water Rocks
            // if (Math.random() < 0.002 && data[i + 1] < 0.0) {
            //     let tempMat = mat4.create();
            //     mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
            //     mat4.rotateX(tempMat, tempMat, Math.PI / 2.0);
            //     let scaleFactor = Math.random() * 0.1 + 0.05;
            //     mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
            //     this.stone1ModelMatrixArray.push(tempMat);
            // }
    
            // if (Math.random() < 0.01 && data[i + 1] >= 0.0) {
            //     let tempMat = mat4.create();
            //     mat4.translate(tempMat, mat4.create(), [data[i] * this.terrainScale, data[i + 1] * this.terrainScale, data[i + 2] * this.terrainScale]);
            //     mat4.rotateX(tempMat, tempMat, Math.PI / 2.0);
            //     let scaleFactor = Math.random() * 0.2 + 0.1;
            //     mat4.scale(tempMat, tempMat, [scaleFactor, scaleFactor, scaleFactor]);
            //     this.stone1ModelMatrixArray.push(tempMat);
            // }
            */
        }

        /*
                this.stone1ModelMatrixArray.forEach(matrix => {
        
                    console.log(matrix);
        
                });
                // this.writeArrayToFile(this.stone1ModelMatrixArray);
                //this.readArrayFromFile();
        */
        //this.writeArrayToFile(this.tree1ModelMatrixArray, 'tree1');
        //this.writeArrayToFile(this.tree2ModelMatrixArray, 'tree2');
        //this.writeArrayToFile(this.tree3ModelMatrixArray, 'tree3');
        //this.writeArrayToFile(this.treeTrunk1ModelMatrixArray, 'trunk1');
        // this.writeArrayToFile(this.treeTrunk2ModelMatrixArray, 'trunk2');
        //this.writeArrayToFile(this.treeLog1ModelMatrixArray, 'log1');
        //this.writeArrayToFile(this.treeLog2ModelMatrixArray, 'log2');

        this.tree1ModelMatrixArray = tree1ModelMatrixArray_data;
        // this.tree1ModelMatrixArray.forEach(mat => {
        //     mat4.scale(mat, mat, [2.0, 2.0, 2.0]);
        // });
        this.tree2ModelMatrixArray = tree2ModelMatrixArray_data;
        // this.tree2ModelMatrixArray.forEach(mat => {
        //     mat4.scale(mat, mat, [2.0, 2.0, 2.0]);
        // });
        this.tree3ModelMatrixArray = tree3ModelMatrixArray_data;
        // this.tree3ModelMatrixArray.forEach(mat => {
        //     mat4.scale(mat, mat, [2.0, 2.0, 2.0]);
        // });
        this.treeTrunk1ModelMatrixArray = treeTrunk1ModelMatrixArray_data;
        this.treeTrunk2ModelMatrixArray = treeTrunk2ModelMatrixArray_data;

        this.treeLog1ModelMatrixArray = treeLog1ModelMatrixArray_data;
        this.treeLog2ModelMatrixArray = treeLog2ModelMatrixArray_data;

        this.stone1ModelMatrixArray = stone1ModelMatrixArray_data;

        this.myGrass.GRASS_BLADES = j;
        let baseColor = new Float32Array([0.06, 0.29, 0.02]);
        let tipColor = new Float32Array([0.07, 1.0, 0.0]);
        this.myGrass.initGrass(grassBladesPos, baseColor, tipColor);

        //Terrain modelMatrix
        var modelMatrix = mat4.create();
        mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, 0.0]);
        mat4.scale(modelMatrix, modelMatrix, [this.terrainScale, this.terrainScale, this.terrainScale]);
        this.terrainModelMatrixArray.push(modelMatrix);

        //TerrainTexture
        let terrainColor = new Uint8Array([0.247 * 255, 0.702 * 255, 0.208 * 255, 255]);
        this.terrainTextue = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.terrainTextue);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, terrainColor);

        //White Texture for other models
        let whitePixel = new Uint8Array([255, 255, 255, 255]);
        this.whiteTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.whiteTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, whitePixel);
        gl.bindTexture(gl.TEXTURE_2D, null);

        //Vegetation Initialisation
        //init Vegetation texture and modelMatrix Array
        let leafTexture = loadTexture("textures/vegetation/leaf1.png", true);
        this.myVegetation.initVegetation(leafTexture, vegetationPosMatrix);

        //models
        this.myModelDraw.initDrawModels();

        //Pond Water.
        this.myPondWater.initPondWater();

        //Atmospheric Scaterring
        this.myAtmScat.initAtmScattering();
    }

    writeArrayToFile(myArray, fileName) {
        const blob = new Blob([JSON.stringify(myArray)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();

        // Clean up the URL object (optional)
        URL.revokeObjectURL(url);
    }


    renderShadow(shadowProgram) {
        // Not sure best way to do this and increases extra work on developer side but at this point fuck it ...
        // make sure to keep this and render function transformation in sync ...
    }

    render() {

        gl.disable(gl.DEPTH_TEST);
        this.myAtmScat.renderAtmScattering(ElephantScene.modelPlacer.getTransformationMatrix(),toRadian(sunAngle));
        gl.enable(gl.DEPTH_TEST);

        if (DEBUGMODE === CAMERA) {
            ElephantScene.sceneCameraRig.render();
        }

        if (DEBUGMODE === SPLINE) {
            this.splineAdjuster.render();
        }


        // this.myVegetation.renderVegetation();

        //for Terrain
        this.myModelDraw.renderModels(this.terrainModel, this.terrainTextue, this.terrainModelMatrixArray, this.lightManager, false);

        //For tree1 model
        this.myModelDraw.renderModels(this.tree1Model, this.whiteTexture, this.tree1ModelMatrixArray, this.lightManager, true);

        //For tree2 model
        this.myModelDraw.renderModels(this.tree2Model, this.whiteTexture, this.tree2ModelMatrixArray, this.lightManager, true);

        //For tree3 model
        this.myModelDraw.renderModels(this.tree3Model, this.whiteTexture, this.tree3ModelMatrixArray, this.lightManager, true);

        //Tree Logs
        this.myModelDraw.renderModels(this.treeLog1Model, this.whiteTexture, this.treeLog1ModelMatrixArray, this.lightManager, true);
        this.myModelDraw.renderModels(this.treeLog2Model, this.whiteTexture, this.treeLog2ModelMatrixArray, this.lightManager, true);

        //Tree Trunks
        this.myModelDraw.renderModels(this.treeTrunk1Model, this.whiteTexture, this.treeTrunk1ModelMatrixArray, this.lightManager, true);
        this.myModelDraw.renderModels(this.treeTrunk2Model, this.whiteTexture, this.treeTrunk2ModelMatrixArray, this.lightManager, true);

        //for stone1 model
        this.myModelDraw.renderModels(this.stone1Model, this.terrainTextue, this.stone1ModelMatrixArray, this.lightManager,true);

        //Elephants
        ElephantScene.programCelShader.use();
        gl.uniformMatrix4fv(ElephantScene.programCelShader.getUniformLocation("pMat"), false, currentCamera.getProjectionMatrix());
        gl.uniformMatrix4fv(ElephantScene.programCelShader.getUniformLocation("vMat"), false, currentCamera.getViewMatrix());
        gl.uniform3fv(ElephantScene.programCelShader.getUniformLocation("viewPos"), currentCamera.getPosition());
        this.lightManager.updateLights(ElephantScene.programCelShader.programObject);

        if (ElephantScene.timer.currentTime <= 30.0) {
            this.renderElephantBaby(ElephantSceneEventIDS.MOVE_ELEPHANT_BABY_1, this.babyPathSpline_1);
            this.renderElephantMother(ElephantSceneEventIDS.MOVE_ELEPHANT_MOTHER_1, this.motherPathSpline_1);
        }
        else if (ElephantScene.timer.currentTime <= 56.0) {
            this.renderElephantBaby(ElephantSceneEventIDS.MOVE_ELEPHANT_BABY_2, this.babyPathSpline_2);
            this.renderElephantMother(ElephantSceneEventIDS.MOVE_ELEPHANT_MOTHER_2, this.motherPathSpline_2);
        }

        gl.depthMask(false);
        this.myGrass.renderGrass();
        gl.depthMask(true);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this.myPondWater.renderPondWater(this.lightManager);
        gl.disable(gl.BLEND);
    }

    renderElephantMother(eventID, pathSpline) {
        var t = ElephantScene.timer.getEventTime(eventID);
        var position = pathSpline.interpolateSpline(t - 0.01);
        var front = pathSpline.interpolateSpline(t);
        // Translation matrix
        let translationMatrix = mat4.create();
        mat4.translate(translationMatrix, translationMatrix, position);
        // Orientation matrix using targetat
        let orientationMatrix = targetat(position, front, vec3.fromValues(0.0, 1.0, 0.0));
        // Combining the matrices
        let finalMatrix = mat4.create();
        mat4.multiply(finalMatrix, translationMatrix, orientationMatrix);
        mat4.scale(finalMatrix, finalMatrix, vec3.fromValues(9.50, 9.50, 9.50));
        gl.uniformMatrix4fv(ElephantScene.programCelShader.getUniformLocation("mMat"), false, finalMatrix);
        //renderModel(this.elephantMother, this.myModelDraw.modelProgram, true,true);
        uploadBoneMatrices(this.elephantMotherAnim, ElephantScene.programCelShader, this.currentMotherAnimation);
        renderModel(this.elephantMotherAnim, ElephantScene.programCelShader, true, true);
    }

    renderElephantBaby(eventID, pathSpline) {
        var t = ElephantScene.timer.getEventTime(eventID);
        var position = pathSpline.interpolateSpline(t - 0.01);
        var front = pathSpline.interpolateSpline(t);
        // Translation matrix
        let translationMatrix = mat4.create();
        mat4.translate(translationMatrix, translationMatrix, position);
        // Orientation matrix using targetat
        let orientationMatrix = targetat(position, front, vec3.fromValues(0.0, 1.0, 0.0));
        // Combining the matrices
        let finalMatrix = mat4.create();
        mat4.multiply(finalMatrix, translationMatrix, orientationMatrix);
        mat4.scale(finalMatrix, finalMatrix, vec3.fromValues(9.50, 9.50, 9.50));
        gl.uniformMatrix4fv(ElephantScene.programCelShader.getUniformLocation("mMat"), false, finalMatrix);
        //renderModel(this.elephantMother, this.myModelDraw.modelProgram, true,true);
        uploadBoneMatrices(this.elephantCubAnim, ElephantScene.programCelShader, this.currentBabyAnimation);
        renderModel(this.elephantCubAnim, ElephantScene.programCelShader, true, true);
    }


    update() {

        this.myAtmScat.updateAtmScattering();
        this.myGrass.updateGrass();
        this.myVegetation.updateVegetation();
        this.myPondWater.updatePondWater();

        updateModel(this.elephantMotherAnim, this.currentMotherAnimation, GLOBAL.deltaTime,2.5);
        updateModel(this.elephantCubAnim, this.currentBabyAnimation, GLOBAL.deltaTime);

        ElephantScene.sceneCamera.setT(ElephantScene.timer.getEventTime(ElephantSceneEventIDS.MOVE_T));
        // updateModel(ElephantScene.modelCat, 0, GLOBAL.deltaTime);
        ElephantScene.timer.increment();

        sunAngle = lerp(0.0,180.0,ElephantScene.timer.getEventTime(ElephantSceneEventIDS.SUN_T));

        if (ElephantScene.timer.isEventStarted(ElephantSceneEventIDS.START_T) && ElephantScene.songStart == 0) {
            //songPlayer.currentTime = 50.0;
            ElephantScene.songStart = 1;
            postProcessingSettings.enableFog = false;
            postProcessingSettings.enableOutline = true;
            postProcessingSettings.enableBloom = false;
        }

        // Fade IN This condition ensures that only change fade when start event is started and it not completed.
        if (ElephantScene.timer.isEventStarted(ElephantSceneEventIDS.START_T) && !ElephantScene.timer.isEventComplete(ElephantSceneEventIDS.START_T)) {
            globalFade = 1.0 - ElephantScene.timer.getEventTime(ElephantSceneEventIDS.START_T);
        }

        if (ElephantScene.timer.isEventStarted(ElephantSceneEventIDS.END_T) && !ElephantScene.timer.isEventComplete(ElephantSceneEventIDS.END_T)) {
            globalFade = ElephantScene.timer.getEventTime(ElephantSceneEventIDS.END_T);
        }

        if (ElephantScene.timer.isEventComplete(ElephantSceneEventIDS.END_T)) {
            this.isComplete = true;
            //this.uninit();
        }
    }

    reset() {
        // reset stuff like timers and events
    }

    uninit() {
        // clean eveything created in init

        this.myAtmScat.uninitAtmScaterring();
        this.myGrass.uninitGrass();
        this.myModelDraw.uninitDrawModels();
        this.myPondWater.uninitPondWater();
        this.myVegetation.unintiVegetation();



        this.lightManager = null;
        this.myGrass = null;
        this.myAtmScat = null;
        this.myPondWater = null;
        this.myVegetation = null;
        this.myModelDraw = null;


        //models
        this.terrainModel = null;
        this.terrainModelMatrixArray.length = 0;
        this.terrainTextue = null;


        this.whiteTexture = null;
        //Tree1
        this.tree1Model = null;
        this.tree1ModelMatrixArray.length = 0;


        //Tree2
        this.tree2Model = null;
        this.tree2ModelMatrixArray.length = 0;

        //Tree3
        this.tree3Model = null;
        this.tree3ModelMatrixArray.length = 0;

        //Tree Logs
        this.treeLog1Model = null;
        this.treeLog1ModelMatrixArray.length = 0;

        this.treeLog2Model = null;
        this.treeLog2ModelMatrixArray.length = 0;

        //Tree Trunks
        this.treeTrunk1Model = null;
        this.treeTrunk1ModelMatrixArray.length = 0;

        this.treeTrunk2Model = null;
        this.treeTrunk2ModelMatrixArray.length = 0;


        //Stones
        this.stone1Model = null;
        this.stone1ModelMatrixArray.length = 0;

        this.elephantMother = null;
        this.elephantCub = null;

        ElephantScene.modelPlacer = null;
        ElephantScene.sceneCamera = null;
        ElephantScene.sceneCameraRig = null;

    }

    renderUI() {

        switch (DEBUGMODE) {
            case MODEL:
                ElephantScene.modelPlacer.renderUI();
                break;
            case CAMERA:
                ElephantScene.sceneCameraRig.renderUI();
                break;
            case LIGHT:
                this.lightManager.renderUI();
                break;
            case SPLINE:
                this.splineAdjuster.renderUI();
                break;
            case NONE:
                break;
        }

    }

    keyboardfunc(key) {
        switch (DEBUGMODE) {
            case MODEL:
                ElephantScene.modelPlacer.handleKeyboardInput(key);
                break;
            case CAMERA:
                ElephantScene.sceneCameraRig.keyboardFunc(key);
                break;
            case LIGHT:
                break;
            case SPLINE:
                this.splineAdjuster.keyboardFunc(key);
                break;
            case NONE:
                break;
        }
        if (key == 'Space') {
            //this.isComplete = true;
        }

        switch (key) {
            case 'KeyN':
                sunAngle += 1.0;
                break;
            case 'KeyM':
                sunAngle -= 1.0;
                break;
            case 'ArrowUp':
                ElephantScene.timer.addTime(0.1);
                break;
            case 'ArrowDown':
                ElephantScene.timer.subtractTime(0.1);
                break;
            case 'Tab':
                break;
        }
    }

    getCamera() {
        // return camera created in setupCameras;
        return ElephantScene.sceneCamera;

    }

    isCompleted() {
        return this.isComplete;
    }
    getSceneTime() {

        return ElephantScene.timer.getT();

    }

    isTooClose(x, y, z) {
        for (let pos of this.treePositions) {
            let dx = pos[0] - x;
            let dy = pos[1] - y;
            let dz = pos[2] - z;
            if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 20.0) {
                return true;
            }
        }
        return false;
    }

    placeTrees(){

    }

}
