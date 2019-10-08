import {RenderObject} from "./RenderObject.js";
import {Motion, Keyframe} from "./motion.js";
import {World} from "./a3.js";

export class Bullet extends RenderObject{
  booletMotion = new Motion((ava)=>this.updateMatrix(ava));
  scene;
  x =0;
  y =0;
  z = 0;
  time = 0;
  globalPos = [0,0,0];
  globalRot = [0, 0, 0];
  constructor(scene,x,y,z, funcx, funcy, funcz, color = 0xff8800) {
    super();
    this.sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5,32,32), new THREE.MeshLambertMaterial({color: color}));
    this.scene = scene;
    this.initx = x;
    this.inity = y;
    this.initz = z;
    this.x = x;
    this.y = y;
    this.z = z;
    this.scene.add(this.sphere);
    this.sphere.matrixAutoUpdate = false;
    this.linkFrame = new THREE.AxesHelper(1);
    this.scene.add(this.linkFrame);
    this.booletMotion.addKeyFrame(new Keyframe("init", 0.0, []));
    this.booletMotion.addKeyFrame(new Keyframe("init2", 2.0, []));
    this.funcx = funcx;
    this.funcy = funcy;
    this.funcz = funcz;

  }

  update(dt) {
    let l =this.doUpdate(dt);
    let col = new THREE.Box3().setFromObject(this.sphere);
    let c = false;
    for(let i = 0; i< World.badDragon.size ;i ++){
      c = c || col.intersectsBox(World.badDragon.collisionBox[i]);
    }
    if(c) {
      World.badDragon.hit();
      return this.destroy();
    }
    return l;
  }

  doUpdate(dt){
    this.time += dt;
    this.booletMotion.timestep(dt);
    this.x = this.initx + this.funcx(this.time);
    this.y = this.inity + this.funcy(this.time);
    this.z = this.initz + this.funcz(this.time);
    if (this.time > 10) {
      return this.destroy();
    }
  }

  destroy(){
    this.scene.remove(this.linkFrame);
    this.scene.remove(this.sphere);
    return "dec";
  }

  updateMatrix(aaa) {
    this.linkFrame.matrix.identity();
    this.linkFrame.matrix.multiply(new THREE.Matrix4().makeTranslation (this.x,this.y,this.z));
    this.sphere.matrix.copy(this.linkFrame.matrix);

    this.sphere.updateMatrixWorld();
    this.linkFrame.updateMatrixWorld();
  }

}

export class badBullet extends Bullet{

  constructor(scene,x,y,z, funcx, funcy, funcz) {
      super(scene,x,y,z, funcx, funcy, funcz, 0xff0000);
  }

  update(dt) {
    let l = this.doUpdate(dt);
    let col = new THREE.Box3().setFromObject(this.sphere);

    let c = false;
    for(let i = 0; i< World.dragon.size ;i ++){
      c = c || col.intersectsBox(World.dragon.collisionBox[i]);
    }
    if(c) {
      console.log("Died");
      World.dragon.dead = true;
      this.destroy();
    }
    return l;
  }
}
