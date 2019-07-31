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
  var gl = canvas.getContext("webgl");

  if(!gl){
    console.log("webgl not working");
    return;
  }

  gl.clearColor(1.0,1.0,1.0,1);
  gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader,myVertexShader);
  gl.compileShader(vertexShader);
  if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
    console.error("Error Compiling Vertex Shader", gl.getShaderInfoLog(vertexShader));
    return;
  }

  gl.shaderSource(fragmentShader,myFragmentShader);
  gl.compileShader(fragmentShader);
  if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)){
    console.error("Errit Compiling Fragment Shader", gl.getShaderInfoLog(fragmentShader));
    return;
  }

  var myProgram = gl.createProgram();
  gl.attachShader(myProgram,vertexShader);
  gl.attachShader(myProgram,fragmentShader);
  gl.linkProgram(myProgram);
  if(!gl.getProgramParameter(myProgram,gl.LINK_STATUS)){
    console.error("Error Link Shaders", gl.getProgramInfoLog(myProgram));
    return;
  }

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

  var vertexBuffer =  gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertexs),gl.STATIC_DRAW);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexes),gl.STATIC_DRAW);

  var positionIndex = gl.getAttribLocation(myProgram,'position');
  var colorindex = gl.getAttribLocation(myProgram,'color');

  gl.vertexAttribPointer(
    positionIndex,
    3,
    gl.FLOAT,
    gl.FALSE,
    6*Float32Array.BYTES_PER_ELEMENT,
    0
  );
  gl.vertexAttribPointer(
    colorindex,
    3,
    gl.FLOAT,
    gl.FALSE,
    6*Float32Array.BYTES_PER_ELEMENT,
    3*Float32Array.BYTES_PER_ELEMENT
  );

  gl.enableVertexAttribArray(positionIndex);
  gl.enableVertexAttribArray(colorindex);

  gl.useProgram(myProgram);

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);

  mat4.identity(worldMatrix);
  mat4.lookAt(viewMatrix,[0,-5,0],[0,0,0],[0,0,1]);
  mat4.perspective(projMatrix,glMatrix.toRadian(90),canvas.width/canvas.height,0.1,1000);

  var worldMatrixLocation = gl.getUniformLocation(myProgram,'mWorld');
  var viewMatrixLocation = gl.getUniformLocation(myProgram,'mView');
  var projMatrixLocation = gl.getUniformLocation(myProgram,'mProj');

  gl.uniformMatrix4fv(worldMatrixLocation,gl.FALSE,worldMatrix);
  gl.uniformMatrix4fv(viewMatrixLocation,gl.FALSE,viewMatrix);
  gl.uniformMatrix4fv(projMatrixLocation,gl.FALSE,projMatrix);

  var xrotaionMatrix = new Float32Array(16);
  var zrotaionMatrix = new Float32Array(16);
  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  var time = 0;

  var render = function(){
    time = performance.now()/1000/6*2*Math.PI;
    mat4.rotate(zrotaionMatrix,identityMatrix,time,[0,0,1]);
    mat4.rotate(xrotaionMatrix,identityMatrix,time/3,[1,0,0]);
    mat4.mul(worldMatrix,zrotaionMatrix,xrotaionMatrix);
    gl.uniformMatrix4fv(worldMatrixLocation,gl.FALSE,worldMatrix);
    gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES,indexes.length,gl.UNSIGNED_SHORT,0);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);

};
