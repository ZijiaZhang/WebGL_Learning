
import {Bullet} from "./Bullet.js";
import {RenderObject} from "./RenderObject.js";
import {Motion, Keyframe} from "./motion.js";
import {World} from "./a3.js";
import {badBullet} from "./Bullet.js";

export class Dragon extends RenderObject{
  dragonMotion = new Motion((ava)=>this.DragonMatricesUpdate(ava));
  dragonMotion2 = new Motion((ava)=>this.DragonMatricesUpdate(ava));
  dragonLinks = [];
  dragonLinkFrames = [];
  size = 13;
  x = 0;
  y = 0;
  z = 0;
  speed = 10;
  globalPos = [0,0,0];
  globalPos1 = [0,1,0];
  globalRot = [0, 180, 0];
  dragonHir = {
    0: -1, /// Body
    1: 0, ///Left Wing
    2: 1, ///Left Wing2
    3: 0, ///Right Wing
    4: 3, ///Right Wing2
    5: 0, // Hand
    6: 0,
    7: 0, //LEG
    8: 7,
    9: 0, // RightLEg
    10: 9,
    11: 0, //HEAD
    12: 11,
  };
  dragonLocation = [
    0, 0, 0, /// Body
    -0.5, 0, 0, ///Left Wing
    -1, 0, 0, ///Left Wing2
    0.5, 0, 0, ///Right Wing
    1, 0, 0,
    0.25, -0.5, 0.45, ///Hand
    -0.25, -0.5, 0.45,
    0.25, -0.5, -0.35, ///LEG
    0, 1, 0,
    -0.23, -0.5, -0.35,
    0, 1, 0,
    0, 0, 0.5,
    0, 1, 0,
  ];
  dragonScale = [
    1, 1, 10, /// Body
    6, 0.2, 5, ///Left Wing
    6, 0.2, 5, ///Left Wing2
    6, 0.2, 5,
    6, 0.2, 5,
    0.1, 1, 0.1, //hand
    0.1, 1, 0.1,
    0.3, 2, 0.3, //LEG
    0.4, 1, 0.4,
    0.3, 2, 0.3,
    0.4, 1, 0.4,
    1, 3, 1,
    1, 1, 3,
  ];

  dragonRotate = [
    0, 0, 0, /// Body
    0, 0, 0, ///Left Wing
    0, 0, 0, ///Left Wing2
    0, 0, 0,
    0, 0, 0,
    180, 0, 0, //hand
    180, 0, 0,
    180, 0, 0, ///Leg
    -90, 0, 0,
    180, 0, 0,
    -90, 0, 0,
    0, 0, 0,
    0, 0, 0,
  ];
  dragonLocalLocation = [
    0, 0, 0, /// Body
    -0.5, 0, 0, ///Left Wing
    -0.5, 0, 0, ///Left Wing2
    0.5, 0, 0,
    0.5, 0, 0,
    0, 0.5, 0, //hand
    0, 0.5, 0,
    0, 0.5, 0,  //LEG
    0, 0.5, 0,
    0, 0.5, 0,
    0, 0.5, 0,
    0, 0.5, 0,
    0, -0.5, 0.5,
  ];

  dragonRotate1 = [
    0, 0, 0, /// Body
    0, 0, 70, ///Left Wing
    0, 0, 20, ///Left Wing2
    0, 0, -70,
    0, 0, -20,
    270, 0, 0, //hand
    260, 0, 0,
    270, 0, 0,  //LEG
    0, 0, 0,
    270, 0, 0,
    0, 0, 0,
    40, 0, 0,
    -40, 0, 0,
  ];
  dragonMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
  boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  pos;
  scale;
  rotate;
  globalx;
  globaly;
  globalz;
  localLoction;
  globalRotx;
  globalRoty;
  globalRotz;
  scaleX = 1;
  scaleY = 1;
  scaleZ = 1;
  DEGTORAD = Math.PI/180;


  constructor(scene,x,y,z){
    super();
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.z = z;
    this.init();
    this.keyboard = new THREEx.KeyboardState();
  }

  initMotion() {
    this.dragonMotion.addKeyFrame(new Keyframe('Initial', 0.0, this.globalPos.concat(this.globalRot).concat(this.dragonLocation).concat(this.dragonScale).concat(this.dragonRotate).concat(this.dragonLocalLocation)));
    this.dragonMotion.addKeyFrame(new Keyframe('Initial2', 1.0, this.globalPos1.concat(this.globalRot).concat(this.dragonLocation).concat(this.dragonScale).concat(this.dragonRotate1).concat(this.dragonLocalLocation)));
    this.dragonMotion.addKeyFrame(new Keyframe('Initial3', 2.0, this.globalPos.concat(this.globalRot).concat(this.dragonLocation).concat(this.dragonScale).concat(this.dragonRotate).concat(this.dragonLocalLocation)));
    this.dragonMotion2.addKeyFrame(new Keyframe('Ini',0.0, [0,0,0].concat(this.globalRot).concat(this.dragonLocation).concat(this.dragonScale).concat(this.dragonRotate).concat(this.dragonLocalLocation)));
    this.dragonMotion2.addKeyFrame(new Keyframe('Ini',3.0, [0,-1000, 0].concat(this.globalRot).concat(this.dragonLocation).concat(this.dragonScale).concat(this.dragonRotate).concat(this.dragonLocalLocation)));

  }
  init(){
    this.initMotion();
    for (let i = 0; i < this.size; i++) {
      let mesh = new THREE.Mesh(this.boxGeometry, this.dragonMaterial);
      mesh.matrixAutoUpdate = false;
      this.dragonLinks.push(mesh);
      this.scene.add(mesh);
      let linkFrame = new THREE.AxesHelper(1);
      this.scene.add(linkFrame);
      linkFrame.matrixAutoUpdate = false;
      this.dragonLinkFrames.push(linkFrame);
    }
  }

  control(dt)
  {
    if (this.keyboard.pressed("w")) {
      this.y = this.y + 10 * dt;
    } else if (this.keyboard.pressed("s")) {
      this.y = this.y - 10 * dt;
    }
    if (this.keyboard.pressed("a")) {
      this.x = this.x - 10 * dt;
    } else if (this.keyboard.pressed("d")) {
      this.x = this.x + 10 * dt;
    }

    if(this.keyboard.pressed(" ")){
      World.addObject( new Bullet(this.scene,this.x, this.y,this.z, (t) => 0, (t) => 0, (t)=> -100*t));
    }
  }
  dead = false;
  ttt = 0;
  update(dt) {
    this.z -= this.speed*dt;
    World.camera.position.z -= this.speed*dt;
    World.controls.target.z -= this.speed*dt;
    World.controls.update();
    if(!this.dead)
      this.dragonMotion.timestep(dt);
    else {
      this.dragonMotion2.timestep(dt);
      this.ttt+=dt;
      if(this.ttt>1){
        return this.destroy();
      }
    }
    if(!this.dead) {
      this.control(dt);
    }
    this.collision();
  }

  destroy(){
    for(let i =0 ;i < this.size; i++){
      this.scene.remove(this.dragonLinks[i]);
      this.scene.remove(this.dragonLinkFrames[i]);
    }
  }

  DragonMatricesUpdate(vars) {
    this.globalx = vars[0];
    this.globaly = vars[1];
    this.globalz = vars[2];
    this.globalRotx = vars[3];
    this.globalRoty = vars[4];
    this.globalRotz = vars[5];
    this.pos = vars.slice(6,6+3*this.size);
    this.scale = vars.slice(6+3*this.size,6+6*this.size);
    this.rotate = vars.slice(6+6*this.size,6+9*this.size);
    this.localLoction = vars.slice(6+9*this.size,6+12*this.size);

    for (let i = 0; i < this.size; i++) {
      if (this.dragonHir[i] === -1) {
        this.dragonLinkFrames[i].matrix.identity();
        this.dragonLinkFrames[i].matrix.multiply(new THREE.Matrix4().makeTranslation(this.globalx + this.x,this.globaly + this.y,this.globalz+ this.z));
        this.dragonLinkFrames[i].matrix.multiply(new THREE.Matrix4().makeRotationX(this.globalRotx*this.DEGTORAD));
        this.dragonLinkFrames[i].matrix.multiply(new THREE.Matrix4().makeRotationY(this.globalRoty*this.DEGTORAD));
        this.dragonLinkFrames[i].matrix.multiply(new THREE.Matrix4().makeRotationZ(this.globalRotz*this.DEGTORAD));
        this.dragonLinkFrames[i].matrix.multiply(new THREE.Matrix4().makeScale(this.scaleX, this.scaleY, this.scaleZ));
      }else{
        this.dragonLinkFrames[i].matrix.copy(this.dragonLinkFrames[this.dragonHir[i]].matrix);
        this.dragonLinkFrames[i].matrix.multiply(new THREE.Matrix4().makeTranslation(this.pos[i*3]*this.scale[this.dragonHir[i]*3],
          this.pos[i*3+1]*this.scale[this.dragonHir[i]*3+1],
          this.pos[i*3+2]*this.scale[this.dragonHir[i]*3+2]));
      }

      this.dragonLinkFrames[i].matrix.multiply(new THREE.Matrix4().makeRotationX(this.rotate[i*3]*this.DEGTORAD));
      this.dragonLinkFrames[i].matrix.multiply(new THREE.Matrix4().makeRotationY(this.rotate[i*3+1]*this.DEGTORAD));
      this.dragonLinkFrames[i].matrix.multiply(new THREE.Matrix4().makeRotationZ(this.rotate[i*3+2]*this.DEGTORAD));
      this.dragonLinks[i].matrix.copy(this.dragonLinkFrames[i].matrix);
      this.dragonLinks[i].matrix.multiply(new THREE.Matrix4().makeTranslation(this.localLoction[i*3]*this.scale[i*3],
        this.localLoction[i*3+1]*this.scale[i*3+1],
        this.localLoction[i*3+2]*this.scale[i*3+2]));
      this.dragonLinks[i].matrix.multiply(new THREE.Matrix4().makeScale(this.scale[i*3], this.scale[i*3+1],  this.scale[i*3+2]));
    }

    for (let i = 0; i<this.size; i++){
      this.dragonLinks[i].updateMatrixWorld();
      this.dragonLinkFrames[i].updateMatrixWorld();
    }
  };

  collisionBox = Array(this.size);
  collision(){
    for (let i =0; i< this.size; i++){
      this.collisionBox[i] = new THREE.Box3().setFromObject(this.dragonLinks[i]);
    }
  }
}

export class BadDragon extends Dragon{
  scaleX = 3;
  scaleY = 3;
  scaleZ = 3;
  globalRot = [0, 0, 0];

  constructor(scene,x,y,z){
    super(scene,x,y,z);
    this.dragonMotion.keyFrameArray = [];
    this.initMotion();
  }

  time = 1;
  update(dt) {
    this.z -= this.speed*dt;
    if(!this.dead)
    this.dragonMotion.timestep(dt);
    else {
      this.dragonMotion2.timestep(dt);
      return this.destroy();
    }
    this.time -= dt;
    if (this.time < 0){
      let k = Math.random()*2 - 1;
      let j = Math.random()*2 -1;
      World.addObject(new badBullet(this.scene, this.x,this.y, this.z, (t)=> k*30*t, (t) =>j*30*t, (z)=>30*z));
      this.time = 0.1;
    }
    this.collision();
  }

  hp = 1000;

  hit(){
    this.hp -=1;
    if(this.hp <= 0){
      console.log("Win");
      this.dead = true;
    }
    document.getElementById("hp").max = 1000;
    document.getElementById("hp").value = this.hp;
  }

}
