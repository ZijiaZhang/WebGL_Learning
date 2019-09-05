const myVertexShader = [
  "precision mediump float;",
  "attribute vec3 color;",
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
  camera.position.z = 2;

  const scene = new THREE.Scene();

  //Create Box
  geometry = new THREE.BoxGeometry(1, 1, 1);

  var faceIndices = ['a', 'b', 'c'];
  var vertexIndex, point;
  geometry.faces.forEach(function(face) { // loop through faces
    for (var i = 0; i < 3; i++) {
      vertexIndex = face[ faceIndices[ i ] ]; // get the face's vertex's index
      point = geometry.vertices[vertexIndex]; // knowing the index, find the vertex in array of vertices
      color = new THREE.Color( // create a color
        point.x + 0.5, //apply xyz as rgb
        point.y + 0.5,
        point.z + 0.5
      );
      face.vertexColors[ i ] = color; //store the color in the face's vertexColors array
    }
  });

  const material = new THREE.ShaderMaterial({vertexShader:myVertexShader,
    fragmentShader: myFragmentShader,
    uniforms: uniforms
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
