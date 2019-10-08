/////////////////////////////////////////////////////////////////////////////////////////
//  UBC CPSC 314,  Vsep2019
//  Assignment 3 Template
/////////////////////////////////////////////////////////////////////////////////////////


import {Dragon} from "./Dragon.js";
import {BadDragon} from "./Dragon.js";

export class World {
  static objs = [];
  static addObject(obj) {
    this.objs.push(obj);
  }

  static removeObj(obj){
    var index = this.objs.indexOf(obj);
    if (index !== -1) this.objs.splice(index, 1);
  }

  constructor() {
    this.canvas = document.getElementById('canvas');
    this.camera;
    this.light;
    this.ambientLight;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    //renderer.setClearColor(0x000000, 0);
    this.renderer.setClearColor(0x111166);     // set background colour
    this.canvas.appendChild(this.renderer.domElement);
    this.start();
  }





//////////////////////////////////////////////////////////
//  initCamera():   SETUP CAMERA
//////////////////////////////////////////////////////////

  initCamera() {
    // set up M_proj    (internally:  camera.projectionMatrix )
    var cameraFov = 90;     // initial camera vertical field of view, in degrees
    // view angle, aspect ratio, near, far
    this.camera = new THREE.PerspectiveCamera(cameraFov, 1, 0.1, 1000);

    var width = 10;
    var height = 5;
//    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0.1, 1000 );

    // set up M_view:   (internally:  camera.matrixWorldInverse )
    this.camera.position.set(0, 12, 30);
    this.camera.up = new THREE.Vector3(0, 1, 0);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);

    // SETUP ORBIT CONTROLS OF THE CAMERA
    var controls = new THREE.OrbitControls(this.camera);
    controls.damping = 0.2;
    controls.autoRotate = false;
  };

// ADAPT TO WINDOW RESIZE
  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }


////////////////////////////////////////////////////////////////////////
// init():  setup up scene
////////////////////////////////////////////////////////////////////////

  init() {
    console.log('init called');

    this.initCamera();
    this.initLights();

    window.addEventListener('resize', this.resize);
    this.resize();
  };

////////////////////////////////////////////////////////////////////////
// initMotions():  setup Motion instances for each object that we wish to animate
////////////////////////////////////////////////////////////////////////


/////////////////////////////////////
// initLights():  SETUP LIGHTS
/////////////////////////////////////

  initLights() {
    this.light = new THREE.PointLight(0xffffff);
    this.light.position.set(0, 4, 2);
    this.scene.add(this.light);
    this.ambientLight = new THREE.AmbientLight(0x606060);
    this.scene.add(this.ambientLight);
  }

  dt = 0.02;

  update() {
    for (let obj of World.objs) {
      if (obj.update(this.dt) === "dec") {
        World.removeObj(obj);
      }
    }

    requestAnimationFrame(() => this.update());      // requests the next update call;  this creates a loop
    this.renderer.render(this.scene, this.camera);
  }

  start() {
    this.init();
    World.dragon = new Dragon(this.scene,0,0,0);
    World.addObject(World.dragon);
    World.badDragon = new BadDragon(this.scene,0,0,-100);
    World.addObject(World.badDragon);
    this.update();
  }
}



