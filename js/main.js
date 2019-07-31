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
  "gl_FragColor = vec4(fragColor,0.5);",
  "}",
  ""].join("\n");


var glstart = function(){

  console.log("Working");
  var canvas = document.getElementById("gameFrame");
  var gl = canvas.getContext("webgl");

  if(!gl){
    alert("Error Initializing OPENGL");
    return;
  }

  gl.clearColor(0,1,1,1);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

  var VertexShader = gl.createShader(gl.VERTEX_SHADER);
  var FragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(VertexShader,myVertexShader);
  gl.shaderSource(FragmentShader,myFragmentShader);


  gl.compileShader(VertexShader);
  if(!(gl.getShaderParameter(VertexShader,gl.COMPILE_STATUS))){
    console.error("Shader Compile Error" ,gl.getShaderInfoLog(VertexShader) );
    return;
  }

  gl.compileShader(FragmentShader);
  if(!(gl.getShaderParameter(FragmentShader,gl.COMPILE_STATUS))){
    console.error("Shader Compile Error" ,gl.getShaderInfoLog(FragmentShader) );
    return;
  }

var myProgram = gl.createProgram();
  gl.attachShader(myProgram,VertexShader);
  gl.attachShader(myProgram,FragmentShader);
  gl.linkProgram(myProgram);
  if(!gl.getProgramParameter(myProgram,gl.LINK_STATUS)){
    console.error("Error link Program", gl.getProgramInfoLog(myProgram));
  }

  var verts = [
    //x,y,z,r,g,b
    0.5,0.5,0.0, 1,0,0,
    0.5,-0.5,0.0, 0,1,0,
    -0.5,0.0,0.0, 0,0,1,

  ];

var Buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,Buffer);            //SET BUFFER as ACTIVE.
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);

var positionAttributeLocation = gl.getAttribLocation(myProgram,"position");
  var colorAttributeLocation = gl.getAttribLocation(myProgram,"color");

gl.vertexAttribPointer(
positionAttributeLocation,
3,
gl.FLOAT,
  gl.FALSE,
6*Float32Array.BYTES_PER_ELEMENT,
  0
);
  gl.vertexAttribPointer(
    colorAttributeLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    6*Float32Array.BYTES_PER_ELEMENT,
    3*Float32Array.BYTES_PER_ELEMENT
  );
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(colorAttributeLocation);
  gl.useProgram(myProgram);

  var worldMatrixIndex = gl.getUniformLocation(myProgram,"mWorld");
  var viewMatrixIndex = gl.getUniformLocation(myProgram,"mView");
  var projMatrixINdex = gl.getUniformLocation(myProgram,"mProj");
  var myWorldMatrix = new Float32Array(16);
  var myViewMatrix = new Float32Array(16);
  var myProjMatrix = new Float32Array(16);

  mat4.identity(myWorldMatrix);
  mat4.lookAt(myViewMatrix,[0,0,5],[0,0,0],[0,1,0]);
  mat4.perspective(myProjMatrix,glMatrix.toRadian(45),canvas.clientWidth/canvas.clientHeight,0.1,1000.0);

  gl.uniformMatrix4fv(worldMatrixIndex,gl.FALSE,myWorldMatrix);
  gl.uniformMatrix4fv(viewMatrixIndex,gl.FALSE,myViewMatrix);
  gl.uniformMatrix4fv(projMatrixINdex,gl.FALSE,myProjMatrix);

  var rotationMatrix = new Float32Array(16);
  var identityMatrix = new Float32Array(16);
  mat4.identity(identityMatrix);
  var time = 0;
  var render = function(){

    time = performance.now()/1000/6*2*Math.PI;
    gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);
    //gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);
    mat4.rotate(rotationMatrix,identityMatrix,time,[0,1,0]);

    gl.uniformMatrix4fv(worldMatrixIndex,gl.FALSE,rotationMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
//render();
};



