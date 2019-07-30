const myVertexShader = [
  "precision mediump float;",
  "attribute vec3 position;",
  "attribute vec3 color;",
  "varying vec3 fragColor;",
  "void main(){",
  "fragColor = color;",
  "gl_Position = vec4(position,1);",
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
  var gl = document.getElementById("gameFrame").getContext("webgl");

  if(!gl){
    alert("Error Initializing OPENGL");
    return;
  }

  gl.clearColor(1,1,1,1);
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
  gl.linkProgram(myProgram)
  if(!gl.getProgramParameter(myProgram,gl.LINK_STATUS)){
    console.error("Error link Program", gl.getProgramInfoLog(myProgram));
  }

  var verts = [
    //x,y,z,r,g,b
    0.5,0.5,0.5, 1,0,0,
    0.5,-0.5,0.5, 0,1,0,
    -0.5,0,0.5, 0,0,1,

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
)
  gl.vertexAttribPointer(
    colorAttributeLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    6*Float32Array.BYTES_PER_ELEMENT,
    3*Float32Array.BYTES_PER_ELEMENT
  )
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(colorAttributeLocation);

  var render = function(){
    if(Math.random() <0.5)
      verts[0] = verts[0]+0.01;
    else
      verts[0] = verts[0] - 0.01;

    if(Math.random() <0.5)
      verts[6] = verts[6]+0.01;
    else
      verts[6] = verts[6] - 0.01;

    if(Math.random() <0.5)
      verts[12] = verts[12]+0.01;
    else
      verts[12] = verts[12] - 0.01;

    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);

    gl.clearColor(Math.random(),Math.random(),Math.random(),1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(myProgram);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    window.setTimeout(render,1000/60);
  }
  render();
}


