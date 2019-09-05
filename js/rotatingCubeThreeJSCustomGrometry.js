const myVertexShader = [
  "precision mediump float;",
  "varying vec3 fragColor;",
  "void main(){",
  "fragColor = color;",
  "gl_Position = gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
  "}"
].join("\n");

const myFragmentShader = [
  "precision mediump float;",
  "varying vec3 fragColor;",
  "void main(){",
  "gl_FragColor = vec4(fragColor,1);",
  "}",
  ""].join("\n");

var geometry;
var glstart = function (){
  var canvas = document.getElementById("gameFrame");

  const uniforms = {};
  const renderer = new THREE.WebGLRenderer({canvas});


  const fov = 45;
  const aspect = canvas.width/canvas.height;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 5;

  const scene = new THREE.Scene();

  //Create Box
  geometry = new THREE.Geometry();
  var vertexs = [
    //X,Y,Z ,R,G,B

    //Front In CCW
    -1.0,-1.0,-1.0, 1.0,0.0,0.0,
    1.0,-1.0,-1.0 , 1.0,0.0,0.0,
    1.0, -1.0, 1.0, 1.0,0.0,0.0,
    -1.0,-1.0,1.0, 1.0,0.0,0.0,

    //Back
    -1.0,1.0,1.0,  0.0,1.0,0.0,
    1.0,1.0,1.0,  0.0,1.0,0.0,
    1.0,1.0,-1.0,  0.0,1.0,0.0,
    -1.0,1.0,-1.0,  0.0,1.0,0.0,

    //Left
    -1.0,1.0,1.0,  0.0,0.0,1.0,
    -1.0,1.0,-1.0,  0.0,0.0,1.0,
    -1.0,-1.0,-1.0,  0.0,0.0,1.0,
    -1.0,-1.0,1.0,  0.0,0.0,1.0,

    //Right
    1.0,-1.0,1.0,  0.3,0.0,0.4,
    1.0,-1.0,-1.0,  0.3,0.0,0.4,
    1.0,1.0,-1.0,  0.3,0.0,0.4,
    1.0,1.0,1.0,  0.3,0.0,0.4,

    //Up
    -1.0,1.0,1.0,  0.0,0.7,0.5,
    -1.0,-1.0,1.0,  0.0,0.7,0.5,
    1.0,-1.0,1.0,  0.0,0.7,0.5,
    1.0,1.0,1.0,  0.0,0.7,0.5,

    //Down
    -1.0,1.0,-1.0,  0.2,0.4,0.0,
    1.0,1.0,-1.0,  0.2,0.4,0.0,
    1.0,-1.0,-1.0,  0.2,0.4,0.0,
    -1.0,-1.0,-1.0,  0.2,0.4,0.0,

  ];

  var indexes = [
    //FRONT
    3,1,2,
    3,0,1,

    //BACK
    7,5,6,
    7,4,5,

    //Left
    11,9,10,
    11,8,9,

    //Right
    15,13,14,
    15,12,13,

    //Up
    19,17,18,
    19,16,17,

    //Down
    23,21,22,
    23,20,21,
  ];
  const verSize = 6;
  var i =0;
  while(i<vertexs.length){
    geometry.vertices.push(new THREE.Vector3(vertexs[i],vertexs[i+1],vertexs[i+2]));
    geometry.colors.push(new THREE.Color(vertexs[i+3],vertexs[i+4],vertexs[i+5]));
    i+=6;
  }
  i=0;
  while(i<indexes.length){
    var face = new THREE.Face3(indexes[i],indexes[i+1],indexes[i+2]);
    face.vertexColors = [geometry.colors[indexes[i]],geometry.colors[indexes[i+1]],geometry.colors[indexes[i+2]]];
    geometry.faces.push(face);
    i+=3;
  }

  geometry.computeBoundingSphere();
  const material = new THREE.ShaderMaterial({vertexShader:myVertexShader,
    fragmentShader: myFragmentShader,
    uniforms: uniforms,
    vertexColors: THREE.VertexColors
  });
  //Create Mesh
  const cube = new THREE.Mesh(geometry, material);

  scene.add(cube);

  var render = function(){
    time = performance.now()/1000/6*2*Math.PI;

    cube.rotation.x = time;
    cube.rotation.y = time *2;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);

};
