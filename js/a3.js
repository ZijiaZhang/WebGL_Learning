/////////////////////////////////////////////////////////////////////////////////////////
//  UBC CPSC 314,  Vsep2019
//  Assignment 3 Template
/////////////////////////////////////////////////////////////////////////////////////////


import {Dragon} from "./Dragon.js";
import * as THREE from "./three.module.js";
import { Water } from './three.js/examples/jsm/objects/Water.js';
import { Sky } from './three.js/examples/jsm/objects/Sky.js';
import {OrbitControls} from "./three.js/examples/jsm/controls/OrbitControls.js";
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
    World.camera;
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
    World.camera = new THREE.PerspectiveCamera(cameraFov, 1, 0.1, 10000);

    var width = 10;
    var height = 5;
//    camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 0.1, 1000 );

    // set up M_view:   (internally:  camera.matrixWorldInverse )
    World.camera.position.set(0, 112, 30);
    World.camera.up = new THREE.Vector3(0, 1, 0);
    World.camera.lookAt(new THREE.Vector3(0,100,0));
    this.scene.add(World.camera);

    // SETUP ORBIT CONTROLS OF THE CAMERA
    World.controls = new OrbitControls( World.camera ,this.renderer.domElement);
    World.controls.target.set(0,100,0);
    World.controls.damping = 0.2;
    World.controls.autoRotate = false;
   // World.controls.autoRotateSpeed = 0;
    World.controls.update();
    World.camera.updateProjectionMatrix();
  };

// ADAPT TO WINDOW RESIZE
  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    World.camera.aspect = window.innerWidth / window.innerHeight;
    World.camera.updateProjectionMatrix();
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
  loaded = false;
  update() {
    if(this.loaded){
      this.updateSun();
      this.updateWater();
    for (let obj of World.objs) {
      if (obj.update(this.dt) === "dec") {
        World.removeObj(obj);
      }
    }
    }

    requestAnimationFrame(() => this.update());      // requests the next update call;  this creates a loop
    this.renderer.render(this.scene, World.camera);
  }
  updateWater(){
    World.water.material.uniforms[ 'time' ].value += 1.0 / 144.0;
    //World.water.z = World.water.z -3;
    //World.water.updateWorldMatrix();
  }
  updateSun() {
    var theta = Math.PI * ( this.parameters.inclination - 0.5 );
    var phi = 2 * Math.PI * ( this.parameters.azimuth - 0.5 );
    this.light.position.x = this.parameters.distance * Math.cos( phi );
    this.light.position.y = this.parameters.distance * Math.sin( phi ) * Math.sin( theta );
    this.light.position.z = this.parameters.distance * Math.sin( phi ) * Math.cos( theta );
    this.sky.material.uniforms[ 'sunPosition' ].value = this.light.position.copy( this.light.position );
    World.water.material.uniforms[ 'sunDirection' ].value.copy( this.light.position ).normalize();
    this.cubeCamera.update( this.renderer, this.sky );
  }


  start() {
    this.init();
    World.dragon = new Dragon(this.scene,0,100,0);
    World.addObject(World.dragon);
    World.badDragon = new BadDragon(this.scene,0,100,-100);
    World.addObject(World.badDragon);

    this.light = new THREE.DirectionalLight( 0xffffff, 0.8 );
    this.scene.add(this.light);
    let that = this;
    var waterGeometry = new THREE.PlaneBufferGeometry( 10000, 10000 );
    World.water = new Water(waterGeometry,{
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( './img/waternormals.jpg', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        that.loaded=true;
      } ),
      alpha: 1.0,
      sunDirection: this.light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: this.scene.fog !== undefined
    });

    World.water.rotation.x = - Math.PI / 2;
    this.scene.add( World.water );


    this.sky = new Sky();
    this.uniforms = this.sky.material.uniforms;
    this.uniforms[ 'turbidity' ].value = 10;
    this.uniforms[ 'rayleigh' ].value = 2;
    this.uniforms[ 'luminance' ].value = 1;
    this.uniforms[ 'mieCoefficient' ].value = 0.005;
    this.uniforms[ 'mieDirectionalG' ].value = 0.8;
    this.parameters = {
      distance: 400,
      inclination: 0.49,
      azimuth: 0.205
    };
    this.cubeCamera = new THREE.CubeCamera( 0.1, 1, 512 );
    this.cubeCamera.renderTarget.texture.generateMipmaps = true;
    this.cubeCamera.renderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
    this.scene.background = this.cubeCamera.renderTarget;

    this.update();
  }
}



