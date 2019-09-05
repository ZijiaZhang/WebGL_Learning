const myVertexShader = [
  "precision mediump float;",
  "attribute vec3 position;",
  "attribute vec3 color;",
  "varying vec3 fragColor;",
  "uniform mat4 mWorld;",
  "uniform mat4 mView;",
  "uniform mat4 mProj;",
  "void main(){",
  "fragColor = color;",
  "gl_Position = mProj * mView * mWorld * vec4(position,1);",
  "}"
].join("\n");

const myFragmentShader = [
  "precision mediump float;",
  "varying vec3 fragColor;",
  "void main(){",
  "gl_FragColor = vec4(fragColor,1);",
  "}",
  ""].join("\n");


var glstart = function (){
  var canvas = document.getElementById("gameFrame");

  const renderer = new THREE.WebGLRenderer({canvas});

  const fov = 45;
  const aspect = canvas.width/canvas.height;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  //Create Box
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  const material = new THREE.MeshBasicMaterial({color: 0x44aa88});
  //Create Mesh
  const cube = new THREE.Mesh(geometry, material);

  scene.add(cube);

  var render = function(){
    time = performance.now()/1000/6*2*Math.PI;
    cube.rotation.x = time;
    cube.rotation.y = time*2;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);

};
