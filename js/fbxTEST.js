var myModel;
var objects;
var glstart = function(){
  //Load Files
  //var async = require("async");

  var files = {v:["text","./Shaders/myVertexShader.vs.glsl"],
  f:["text","./Shaders/myFragmentShader.fs.glsl"],
  model:["json","./Models/Max.json"],
  img0:["image","./img/TX_Max01_Body_D.png"],
  img1:["image","./img/TX_Max01_Bag_D.png"],
    img2:["image","./img/tx_max01_head_d.png"],
    img3:["image","./img/tx_max01_head_d.png"],
    img4:["image","./img/tx_max01_head_d.png"],
    img5:["image","./img/tx_max01_hairs_d.png"],
    img6:["image","./img/TX_Max01_Bag_D.png"]};
  var meta = {
    modelcount: 7,
    texturecount: 7
  }
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


var Initialize = function (data,datainfos){
  var myVertexShader = data.v;
  var myFragmentShader = data.f;
  myModel = data.model;
  var myTexture = [];// data.img0;

  var meshCount = datainfos.modelcount;
  var textureCount = datainfos.texturecount;
  for(var i =0;i<textureCount;i++){
    myTexture.push(data["img"+i]);
  }
  objects = [];

  var canvas = document.getElementById("gameFrame");
  var gl = canvas.getContext("webgl");

  if(!gl){
    console.log("webgl not working");
    return;
  }

  gl.clearColor(1,1.0,1.0,1);
  gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  for (var i =0; i< meshCount;i++)
  {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertexShader, myVertexShader);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error("Error Compiling Vertex Shader", gl.getShaderInfoLog(vertexShader));
      return;
    }

    gl.shaderSource(fragmentShader, myFragmentShader);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error("Errit Compiling Fragment Shader", gl.getShaderInfoLog(fragmentShader));
      return;
    }

    var myProgram = gl.createProgram();
    gl.attachShader(myProgram, vertexShader);
    gl.attachShader(myProgram, fragmentShader);
    gl.linkProgram(myProgram);
    if (!gl.getProgramParameter(myProgram, gl.LINK_STATUS)) {
      console.error("Error Link Shaders", gl.getProgramInfoLog(myProgram));
      return;
    }

    var maxVertices = myModel.meshes[i].vertices;
    var maxIndices = [].concat.apply([], myModel.meshes[i].faces);
    var maxTexCoords = myModel.meshes[i].texturecoords[0];

    var maxPosVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, maxPosVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(maxVertices), gl.STATIC_DRAW);

    var maxTexCoordVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, maxTexCoordVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(maxTexCoords), gl.STATIC_DRAW);

    var maxIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, maxIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(maxIndices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, maxPosVertexBufferObject);
    var positionAttribLocation = gl.getAttribLocation(myProgram, 'vertPosition');
    gl.vertexAttribPointer(
      positionAttribLocation, // Attribute location
      3, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, maxTexCoordVertexBufferObject);
    var texCoordAttribLocation = gl.getAttribLocation(myProgram, 'vertTexCoord');
    gl.vertexAttribPointer(
      texCoordAttribLocation, // Attribute location
      2, // Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0
    );
    gl.enableVertexAttribArray(texCoordAttribLocation);


    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, myTexture[i]);
    gl.bindTexture(gl.TEXTURE_2D, null);


    gl.useProgram(myProgram);

    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    mat4.identity(worldMatrix);
    mat4.lookAt(viewMatrix, [0, -5, 0], [0, 0, 0], [0, 0, 1]);
    mat4.perspective(projMatrix, glMatrix.toRadian(90), canvas.width / canvas.height, 0.1, 1000);

    var worldMatrixLocation = gl.getUniformLocation(myProgram, 'mWorld');
    var viewMatrixLocation = gl.getUniformLocation(myProgram, 'mView');
    var projMatrixLocation = gl.getUniformLocation(myProgram, 'mProj');

    gl.uniformMatrix4fv(worldMatrixLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(viewMatrixLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projMatrixLocation, gl.FALSE, projMatrix);

    var scaleMatrix = new Float32Array(16);
    var zrotaionMatrix = new Float32Array(16);
    var transformationMatrix = new Float32Array(16);
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);
    mat4.translate(transformationMatrix, identityMatrix, [0, 0, -80]);
    mat4.scale(scaleMatrix, identityMatrix, [0.05, 0.05, 0.05]);



    var object = {
      programinfo: myProgram,
      worldMatrix:worldMatrix,
      scaleMatrix: scaleMatrix,
      indCount:maxIndices.length,
      zrotaionMatrix: zrotaionMatrix,
      transformationMatrix: transformationMatrix,
      identityMatrix: identityMatrix,
      worldMatrixLocation:worldMatrixLocation,
      viewMatrixLocation:viewMatrixLocation,
      projMatrixLocation:projMatrixLocation,
      VertexBuffer: maxPosVertexBufferObject,
      TexcoodBuffer: maxTexCoordVertexBufferObject,
      IndexBuffer: maxIndexBufferObject,
      positionAttLoc: positionAttribLocation,
      texCoordAttLoc:texCoordAttribLocation,
      texture: texture,
      tick: function(object){
        gl.bindTexture(gl.TEXTURE_2D,object.texture);
        gl.activeTexture(gl.TEXTURE0);
        mat4.rotate(object.zrotaionMatrix,object.identityMatrix,time,[0,0,1]);

        mat4.mul(object.worldMatrix,object.zrotaionMatrix,object.scaleMatrix);
        mat4.mul(object.worldMatrix,object.worldMatrix,object.transformationMatrix);
        gl.uniformMatrix4fv(object.worldMatrixLocation,gl.FALSE,object.worldMatrix);


      }
    };
    objects.push(object);
  }
  var time = 0;
  var render = function(){
    time = performance.now()/1000/6*2*Math.PI;



    gl.clear(gl.DEPTH_BUFFER_BIT|gl.COLOR_BUFFER_BIT);
    objects.forEach(function (object) {
      gl.bindBuffer(gl.ARRAY_BUFFER, object.VertexBuffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, object.TexcoodBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.IndexBuffer);
      gl.bindBuffer(gl.ARRAY_BUFFER, object.VertexBuffer);
      gl.vertexAttribPointer(
        object.positionAttLoc, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
      );
      gl.enableVertexAttribArray(object.positionAttLoc);

      gl.bindBuffer(gl.ARRAY_BUFFER, object.TexcoodBuffer);
      gl.vertexAttribPointer(
        object.texCoordAttLoc, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0
      );
      gl.enableVertexAttribArray(object.texCoordAttLoc);


      gl.useProgram(object.programinfo);

      object.tick(object);
      gl.drawElements(gl.TRIANGLES,object.indCount,gl.UNSIGNED_SHORT,0);
    });

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);

};
