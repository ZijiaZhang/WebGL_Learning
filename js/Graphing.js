var vertexes;
var indexes;

var glstart = function(){
  //Load Files
  //var async = require("async");

  var files = {v:["text","./Shaders/graghVertexShader.vs.glsl"],
    f:["text","./Shaders/graphFragmentShader.fs.glsl"],
    model:null};
  var meta = {
    modelcount: 0,
    texturecount: 0
  };
  var results= {};
  async.forEachOf(files,function(value,key,callback2){
    loadResource(value,function(err,data){
      if(err) {
        return callback2(err);
      }
      else{
        try{results[key] = data;}
        catch (e) {
          return callback2(e);
        }
        callback2();
      }

    });
  },function(err){
    if(err){
      alert('Error Loading Files');
      console.error(err);
    }else{
      Initialize(results,meta);
    }
  });

};

var Initialize = function (result, data) {
  var vertexShadeSource = result.v;
  var fragmentShaderSource = result.f;


  var canvas = document.getElementById("gameFrame");
  var gl = canvas.getContext("webgl");

  if(!gl){
    console.log("webgl not working");
    return;
  }

  gl.clearColor(1,1.0,1.0,1);
  gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);

  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader,vertexShadeSource);
  gl.compileShader(vertexShader);
  if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
    console.error("Error Compiling Vertex Shader", gl.getShaderInfoLog(vertexShader));
    return;
  }

  gl.shaderSource(fragmentShader,fragmentShaderSource);
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

  m = 100;
  n=100
  var t = value(m,n);


  // vertexes =
  //   [0,0,0,
  //   10,10,10,5,5,3
  //   ];

  vertexes =  t.result;

  indexes = t.ind//[0,1,2];




  var vertexBuffer =  gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertexes),gl.STATIC_DRAW);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexes),gl.STATIC_DRAW);

  var positionIndex = gl.getAttribLocation(myProgram,'vertPosition');


  gl.vertexAttribPointer(
    positionIndex,
    3,
    gl.FLOAT,
    gl.FALSE,
    3*Float32Array.BYTES_PER_ELEMENT,
    0
  );

  gl.enableVertexAttribArray(positionIndex);

  gl.useProgram(myProgram);

  var worldMatrix = new Float32Array(16);
  var viewMatrix = new Float32Array(16);
  var projMatrix = new Float32Array(16);

  mat4.identity(worldMatrix);

  mat4.lookAt(viewMatrix,[-10,-5,10],[5,5,0],[0,0,1]);
  mat4.perspective(projMatrix,glMatrix.toRadian(90),canvas.width/canvas.height,0.1,1000);

  var worldMatrixLocation = gl.getUniformLocation(myProgram,'mWorld');
  var viewMatrixLocation = gl.getUniformLocation(myProgram,'mView');
  var projMatrixLocation = gl.getUniformLocation(myProgram,'mProj');

  gl.uniformMatrix4fv(worldMatrixLocation,gl.FALSE,worldMatrix);
  gl.uniformMatrix4fv(viewMatrixLocation,gl.FALSE,viewMatrix);
  gl.uniformMatrix4fv(projMatrixLocation,gl.FALSE,projMatrix);

  var time = 0;
  var identityMatrix = new Float32Array(16);
  var zRoataionMatrix = new Float32Array(16);
  var scaleMatrix = new Float32Array(16);
  var transformationMatrix = new Float32Array(16);

  mat4.identity(identityMatrix);
  mat4.identity(zRoataionMatrix);
  mat4.scale(scaleMatrix,identityMatrix,[0.1,0.1,10]);
  mat4.translate(transformationMatrix, identityMatrix, [-m/2, -n/2, 0]);
  var render = function(){
    mat4.rotate(zRoataionMatrix,identityMatrix,document.getElementById("angle").value,[0,0,1]);

    mat4.identity(worldMatrix);
    mat4.mul(worldMatrix,worldMatrix,scaleMatrix);
    mat4.mul(worldMatrix,worldMatrix,zRoataionMatrix);
    mat4.mul(worldMatrix,worldMatrix,transformationMatrix);

    gl.uniformMatrix4fv(worldMatrixLocation,gl.FALSE,worldMatrix);
    gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES,indexes.length,gl.UNSIGNED_SHORT,0);
    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);

};

var value = function(m,n) {
  var result = new Array((m + 1) * (m + n + 1));
  var r = [];
  var indexes = [];
  for (var i = 0; i < m + 1; i++) {
    for (var j = 0; j < m + n  + 1; j++) {
      if(i+j > m+n){
        result[i*(m+n+1)+j] = 0
      } else if (i === 0) {
        result[i*(m+n+1)+j] = 0
      } else if (j === 0) {
        result[i*(m+n+1)+j] = 1
      } else {
        result[i*(m+n+1)+j] = (result[(i - 1)*(m+n+1)+j + 1] + result[i*(m+n+1)+j - 1]) / 2
      }
      r.push(i);
      r.push(j);
      r.push(result[i*(m+n+1)+j]);
      if(i>0 && j>0){
        indexes.push(i*(m+n+1)+j);
        indexes.push((i-1)*(m+n+1)+j);
        indexes.push((i-1)*(m+n+1)+j-1);

        indexes.push(i*(m+n+1)+j);
        indexes.push(i*(m+n+1)+j-1);
        indexes.push((i-1)*(m+n+1)+j-1);
      }
    }
  }
  console.log(r.length);
  console.log(indexes.length);
  return {result:r,ind :indexes};
};
