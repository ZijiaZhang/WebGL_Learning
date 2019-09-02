var gl;
var canvas;
var renderVertexSource =
  ' attribute vec3 vertex;' +
  ' varying vec2 texCoord;' +
  ' void main() {' +
  '   texCoord = vertex.xy*0.5+0.5;' + //Map (-1,-1) (1,1) to (0,0),(1,1)
  '   gl_Position = vec4(vertex, 1.0);' +
  ' }';
var renderFragmentSource =
  ' precision highp float;' +
  ' varying vec2 texCoord;' +
  ' uniform sampler2D texture;' +
  ' void main() {' +
  '   gl_FragColor = texture2D(texture, texCoord);' +
  ' }';

var tracerVertexSource =
  ' attribute vec3 vertex;' +
  ' uniform vec3 eye, ray00, ray01, ray10, ray11;' +
  ' varying vec3 initialRay;' +
  ' void main() {' +
  '   vec2 percent = vertex.xy * 0.5 + 0.5;' +
  '   initialRay = mix(mix(ray00, ray01, percent.y), mix(ray10, ray11, percent.y), percent.x);' +
  '   gl_Position = vec4(vertex, 1.0);' +
  ' }';



var tracerFragmentSourceCONST =
  "precision highp float;" +
  "uniform vec3 eye;" +
  "varying vec3 initialRay;" +
  "uniform float textureWeight;" +
  "uniform float timeSinceStart;" +
  "uniform sampler2D texture;" +
  "vec3 roomCubeMin = vec3(-1.0,-1.0,-1.0);"+
  "vec3 roomCubeMax = vec3(1.0,1.0,1.0);"+
  "uniform vec3 light;";

var intersectCubeCode =
  "vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {" +
  " vec3 tMin = (cubeMin - origin) / ray;" +
  " vec3 tMax = (cubeMax - origin) / ray;" +
  "   vec3 t1 = min(tMin, tMax);" +
  "   vec3 t2 = max(tMin, tMax); " +
  "  float tNear = max(max(t1.x, t1.y), t1.z);" +
  "   float tFar = min(min(t2.x, t2.y), t2.z);" +
  "   return vec2(tNear, tFar); " +
  "} ";

//Generate Normal Vector for a cube.
var cubeNormal =  "vec3 normalForCube(vec3 hit, vec3 cubeMin, vec3 cubeMax) {   " +
  "if(hit.x < cubeMin.x + 0.0001) return vec3(-1.0, 0.0, 0.0);   " +
  "else if(hit.x > cubeMax.x - 0.0001) return vec3(1.0, 0.0, 0.0);" +
  "   else if(hit.y < cubeMin.y + 0.0001) return vec3(0.0, -1.0, 0.0);" +
  "   else if(hit.y > cubeMax.y - 0.0001) return vec3(0.0, 1.0, 0.0);" +
  "   else if(hit.z < cubeMin.z + 0.0001) return vec3(0.0, 0.0, -1.0);" +
  "   else return vec3(0.0, 0.0, 1.0);" +
  " }";

//Generate Random Number
var random = "float random(vec3 scale, float seed) {\n" +
  "  return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n" +
  "}";

var uniformRandomDirection = "vec3 uniformlyRandomDirection(float seed) {\n" +
  "  float u = random(vec3(12.9898, 78.233, 151.7182), seed);\n" +
  "  float v = random(vec3(63.7264, 10.873, 623.6736), seed);\n" +
  "  float z = 1.0 - 2.0 * u;\n" +
  "  float r = sqrt(1.0 - z * z);\n" +
  "  float angle = 6.283185307179586 * v;\n" +
  "  return vec3(r * cos(angle), r * sin(angle), z);\n" +
  "}";

var uniformRandomVector = "vec3 uniformlyRandomVector(float seed) {\n" +
  "  return uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed));\n" +
  "}";

var getShadowFunction = function(){
  var source = 'float shadow(vec3 location, vec3 toLight) {';
  source += concat(objects, function(o){ return o.shadowTestCode(); });
  source += 'return 1.0;}';
  return source;
};



var Bounces = '10';
var rayLength = '1000.0';
var getcalculatedColorFunction = function(objects){
  return 'vec3 calculatedColor(vec3 origin, vec3 ray, vec3 light){' +
    'vec3 colorMask = vec3(1.0);' +
    'vec3 accumulatedColor = vec3(0.0);' +
    'for(int bounce = 0; bounce < ' + Bounces +'; bounce++){'+
    'vec2 tRoom = intersectCube(origin,ray,roomCubeMin,roomCubeMax);' +
    concat(objects, function(o){ return o.intersectCode(); }) +
    'float t = ' + rayLength + ';'+
      //Ignore the first point of intersection to the Room Cube
    'if(tRoom.x < tRoom.y) t = tRoom.y;' +
    concat(objects, function(o){ return o.firstIntersectionPointCode(); })  +

    '     vec3 hit = origin + ray * t;' +
    '     vec3 surfaceColor = vec3(0.75);' +
    '     float specularHighlight = 0.0;' +
    '     vec3 normal;' +
    //If intersect With Room
    'if(t == tRoom.y){' +
    'normal = -normalForCube(hit, roomCubeMin, roomCubeMax);' + //Pointing Inside the cube
    'if(hit.x < -0.9999) surfaceColor = ' + getRoomFaceColor(0) + ';' +
    'else if(hit.x > 0.9999) surfaceColor = ' + getRoomFaceColor(1) + ';' +
    'else if(hit.y < - 0.9999) surfaceColor = ' + getRoomFaceColor(2) + ';' +
    'else if(hit.y > 0.9999) surfaceColor = ' + getRoomFaceColor(3) + ';' +
    'ray = reflect(ray, normal);' +
    '}else if (t == '+ rayLength +'){' +
    'break;' +
    '}else{' +
    'if(false){' +
    '' +
    '}' +
    concat(objects, function(o){ return o.getNormalCalculationCode(); }) +
    'ray = reflect(ray, normal);\n' +
    '      vec3 reflectedLight = normalize(reflect(light - hit, normal));\n' +
    '      specularHighlight = max(0.0, dot(reflectedLight, normalize(hit - origin)));\n' +
    '      specularHighlight = 2.0 * pow(specularHighlight, 20.0);'+
    '}' +
    'vec3 toLight = light - hit;\n' +
    '    float diffuse = max(0.0, dot(normalize(toLight), normal));\n' +
    '    float shadowIntensity = shadow(hit + normal * 0.001, toLight);\n' +
    '    colorMask *= surfaceColor;\n' +
    '    accumulatedColor += colorMask * (0.5 * diffuse * shadowIntensity);\n' +
    '    accumulatedColor += colorMask * specularHighlight * shadowIntensity;\n' +
    '    origin = hit;' +
    '}'+
  ' return accumulatedColor;'+
  '}';
};

var lightSize = '0.1';

var getMainFunction = function() {
  return '' +
    ' void main() {' +
    '   vec3 newLight = light + uniformlyRandomVector(timeSinceStart - 53.0) * ' + lightSize + ';' +
    '   vec3 texture = texture2D(texture, gl_FragCoord.xy / '+res+'.0).rgb;' +
    '   gl_FragColor = vec4(mix(calculatedColor(eye, initialRay, newLight), texture, textureWeight), 1.0);' +
    ' }';
};

var getRoomFaceColor = function (face) {
  switch(face){
    case 0:
      return 'vec3(1.0,0.0,0.0)';
    case 1:
      return 'vec3(0.0,1.0,0.0)';
    case 2:
      return 'vec3(0.0,1.0,0.8)';
    case 3:
      return 'vec3(0.0,0.0,1.0)';
    default:
      return 'vec3(0.8,0.8,0.8)';
  }
};

var compileShader = function (source , type ){
  var shader = gl.createShader(type);
  gl.shaderSource(shader,source);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
    console.error("Shader Compile Error" + gl.getShaderInfoLog(shader));
    console.log(source);
    throw 'Compile Error'+ gl.getShaderInfoLog(shader);
  }
  return shader;
};

var makeProgram = function (vertexSource, fragmentSource) {
  var program = gl.createProgram();
  var vertexShader = compileShader(vertexSource,gl.VERTEX_SHADER);
  var fragmentShader = compileShader(fragmentSource,gl.FRAGMENT_SHADER);
  gl.attachShader(program,fragmentShader);
  gl.attachShader(program, vertexShader);
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
    console.error("Program Link Error" + gl.getProgramInfoLog(program));
    throw 'Link Error' + gl.getProgramInfoLog(program);
  }
  return program;
};

var makeTracerFragmentSource = function(objects) {
  return tracerFragmentSourceCONST +
    concat(objects, function (o) {
      return o.getGlobalCode();
    }) +
    intersectCubeCode +
    cubeNormal +
    random +
    uniformRandomDirection +
    uniformRandomVector +
    getShadowFunction(objects) +
    getcalculatedColorFunction(objects) +
    getMainFunction();
};

function Cube(cubeMin,cubeMax,id){
  this.cubeMin = cubeMin;
  this.cubeMax = cubeMax;

  this.id = id;
  this.cubeMinCode = 'Cube'+this.id + 'Min';
  this.cubeMaxCode = 'Cube' + this.id +'Max';
  this.tString = 'tCube' + this.id;

  this.intersectCode = function(){
      return 'vec2 '+ this.tString + '=intersectCube(origin,ray,'+ this.cubeMinCode + ','+ this.cubeMaxCode+');'  ;
  };
  this.getGlobalCode = function(){
    return 'uniform vec3 '+ this.cubeMinCode + ';' +
      'uniform vec3 ' + this.cubeMaxCode + ';';
  };
  this.shadowTestCode = function () {
    return 'vec2 '+ this.tString +' = intersectCube(location,toLight,' + this.cubeMinCode +',' + this.cubeMaxCode + ');' +
      'if('+this.tString+'.x > 0.0 && ' + this.tString + '.x<0.9999 && ' + this.tString + '.x < ' + this.tString + '.y) return 0.0;';
  };

  this.firstIntersectionPointCode = function () {
    return '' +
      ' if(' + this.tString + '.x > 0.0 && ' + this.tString + '.x < ' + this.tString + '.y && ' + this.tString + '.x < t) t = ' + this.tString + '.x;';
  };

  this.getNormalCalculationCode = function(){
    return '' +
      // have to compare intersectStr.x < intersectStr.y otherwise two coplanar
      // cubes will look wrong (one cube will "steal" the hit from the other)
      ' else if(t == ' + this.tString + '.x && ' + this.tString + '.x < ' + this.tString + '.y) normal = normalForCube(hit, ' + this.cubeMinCode + ', ' + this.cubeMaxCode + ');';
  };
  this.setUniform= function () {
    pathTracerUniform[this.cubeMinCode] = {type: 'vec3', value:this.cubeMin};
    pathTracerUniform[this.cubeMaxCode] = {type: 'vec3', value:this.cubeMax};
  };
}

var res = 1024;

var objects = [
  new Cube([-0.25,-0.25,-0.25],[0.25,0.25,0.25],0),
  new Cube([-0.5,-0.5,-0.5],[-0.25,-0.25,-0.25],1),
  new Cube([0.25,0.25,0.25],[0.5,0.5,0.5],2),
]; //List of Cubes;



var buildBuffer = function(type,value){
  var buffer = gl.createBuffer();
  gl.bindBuffer(type,buffer);
  gl.bufferData(type,value,gl.STATIC_DRAW);
  return buffer;
};

var angleX = 0;
var angleY = 0;
var zoomZ = 2.5;
var eye = [0, 0, 0];
var light = [0.4, 0.5, -0.6];
var worldMatrix = new Float32Array(16);
var lookAtMatrix = new Float32Array(16);
var projMatrix = new Float32Array(16);
var resultMAtrix = new Float32Array(16);
var t = new Float32Array(16);
var identityMatrix = new Float32Array(16);
var invertMatrix = new Float32Array(16);
var zeroMatrix = new Float32Array(16);
mat4.identity(worldMatrix);
mat4.identity(lookAtMatrix);
mat4.identity(projMatrix);
mat4.identity(identityMatrix);
mat4.sub(zeroMatrix,identityMatrix,identityMatrix);

var pathTracerUniform ={};


var setUniforms = function (program, uniforms) {
  for (var name in uniforms){
    var obj = uniforms[name];
    var type = obj.type;
    var value = obj.value;
    var location = gl.getUniformLocation(program, name);
    if(location == null)
      continue;
    switch (type) {
      case 'float':
        gl.uniform1f(location, value);
        break;
      case 'vec3':
        gl.uniform3fv(location, new Float32Array(value));
        break;
      case 'mat4':
        gl.uniformMatrix4fv(location, false, value);
        break;
      default:
        console.error("attribError");
        break;
    }
  }
};

var getEyeRay = function (mat,x,y) {
  var temp = [0.0,0.0,0.0,0.0];
  vec4.transformMat4(temp,[x,y,0.0,1.0],mat);
  for(var i = 0 ; i< 4 ; i++){
    temp[i]/=temp[3];
  }
  temp.pop();
  vec3.sub(temp,temp,eye);
  return temp;
};

var program = null;
var tracerVertexAttribIndex = 0;
var sample = 0;
var updateProgram = function(){
  Bounces = parseInt(document.getElementById("Bounces").value).toString();
  sample = 0;

  var cubeMin1s = document.getElementsByClassName("CubeMin1");
  var cubeMin2s = document.getElementsByClassName("CubeMin2");
  var cubeMin3s = document.getElementsByClassName("CubeMin3");
  var cubeMax1s = document.getElementsByClassName("CubeMax1");
  var cubeMax2s = document.getElementsByClassName("CubeMax2");
  var cubeMax3s = document.getElementsByClassName("CubeMax3");

  objects = [];
  for(var i = 0; i< cubeMin1s.length; i++){
    objects.push(new Cube([parseFloat(cubeMin1s[i].value),
      parseFloat(cubeMin2s[i].value),
      parseFloat(cubeMin3s[i].value)
    ],[parseFloat(cubeMax1s[i].value),
      parseFloat(cubeMax2s[i].value),
      parseFloat(cubeMax3s[i].value)
    ],i));
  }

  program = makeProgram(tracerVertexSource, makeTracerFragmentSource(objects));
  tracerVertexAttribIndex = gl.getAttribLocation(program,'vertex');
  gl.enableVertexAttribArray(tracerVertexAttribIndex);
};
var count = 1;
var addCube = function(){
  count++;
  document.getElementById("CubeList").innerHTML+= "<li>\n  " +
    "<label> Cube"+count+ " </label>" +
    "<input type = \"number\" class=\"CubeMin1\" value = \"-0.25\" onchange=\"updateProgram()\">\n" +
    "<input type = \"number\" class=\"CubeMin2\" value = \"-0.25\" onchange=\"updateProgram()\">\n" +
    "<input type = \"number\" class=\"CubeMin3\" value = \"-0.25\" onchange=\"updateProgram()\">\n" +
    "<input type = \"number\" class=\"CubeMax1\" value = \"0.25\" onchange=\"updateProgram()\">\n" +
    "<input type = \"number\" class=\"CubeMax2\" value = \"0.25\" onchange=\"updateProgram()\">\n" +
    "<input type = \"number\" class=\"CubeMax3\" value = \"0.25\" onchange=\"updateProgram()\">\n" +
    "</li>";

};


var Initialize = function() {

  gl = null;
  canvas = document.getElementById('gameFrame');
  gl = canvas.getContext('webgl');
  if(!gl){
    console.log("Does Not support Webgl");
    return;
  }
  // canvas.width = res;
  //   // canvas.height = res;
  gl.canvas.width = res;
  gl.canvas.height = res;
  gl.viewport(0, 0, res, res);



  var screenVertex = [
    -1,-1,
    -1,1,
    1,-1,
    1,1
  ];



  var pathTracerRenderProgram = makeProgram(renderVertexSource,renderFragmentSource);
  var pathTracerRenderVertexAttrib = gl.getAttribLocation(pathTracerRenderProgram,'vertex');
  gl.enableVertexAttribArray(pathTracerRenderVertexAttrib);


  var screenVertexBuffer = buildBuffer(gl.ARRAY_BUFFER,new Float32Array(screenVertex));


  var pathTracerFrameBuffer = gl.createFramebuffer();

  var v = [];

  v.push(gl.createTexture());
  gl.bindTexture(gl.TEXTURE_2D,v[0]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, res, res, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
  gl.bindTexture(gl.TEXTURE_2D,null);

  v.push(gl.createTexture());
  gl.bindTexture(gl.TEXTURE_2D,v[1]);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, res, res, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
  gl.bindTexture(gl.TEXTURE_2D,null);



  var then  = performance.now();

  updateProgram();

  var Tick = function(){
    temp = document.getElementById("angle").value;
    if(temp!==angleY){
      sample = 0;
      angleY = temp;
    }


    time = performance.now();
    document.getElementById('Frame').innerText = Math.floor(1000/(time-then));
    then = time;
    eye[0] = zoomZ * Math.sin(angleY) * Math.cos(angleX);
    eye[1] = zoomZ * Math.sin(angleX);
    eye[2] = zoomZ * Math.cos(angleY) * Math.cos(angleX);

    mat4.lookAt(lookAtMatrix,eye,[0,0,0],[0,1,0]);
    mat4.perspective(projMatrix,glMatrix.toRadian(90),1,0.1,100);
    mat4.mul(resultMAtrix,projMatrix,lookAtMatrix);

    var r = [(Math.random() * 2 - 1)/10240.0, (Math.random() * 2 - 1)/10240.0, 0]
    mat4.translate(t, identityMatrix ,r);
    mat4.mul(resultMAtrix,resultMAtrix,t);
    mat4.invert(invertMatrix,resultMAtrix);


    for( let object of objects){
      object.setUniform();
    }
    pathTracerUniform['light'] = {type: 'vec3', value:light};
    pathTracerUniform.eye = {type: 'vec3', value:eye};
    pathTracerUniform.glossiness = {type: 'float', value:0};
    pathTracerUniform.ray00 = {type: 'vec3', value:getEyeRay(invertMatrix, -1, -1)};
    pathTracerUniform.ray01 = {type: 'vec3', value:getEyeRay(invertMatrix, -1, +1)};
    pathTracerUniform.ray10 = {type: 'vec3', value:getEyeRay(invertMatrix, +1, -1)};
    pathTracerUniform.ray11 = {type: 'vec3', value:getEyeRay(invertMatrix, +1, +1)};
    pathTracerUniform.timeSinceStart = {type: 'float', value:time};
    pathTracerUniform.textureWeight = {type: 'float', value:sample/(sample+1)};

    gl.useProgram(program);
    setUniforms(program,pathTracerUniform);

    gl.useProgram(program);
    gl.bindFramebuffer(gl.FRAMEBUFFER,pathTracerFrameBuffer);
    gl.bindTexture(gl.TEXTURE_2D,v[0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, screenVertexBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,v[1],0);
    gl.vertexAttribPointer(tracerVertexAttribIndex,2,gl.FLOAT, false,0,0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    v.reverse();

    sample++;

    gl.useProgram(pathTracerRenderProgram);
    gl.bindTexture(gl.TEXTURE_2D,v[0]);
    gl.bindBuffer(gl.ARRAY_BUFFER,screenVertexBuffer);
    gl.vertexAttribPointer(tracerVertexAttribIndex,2,gl.FLOAT,false,0,0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);


    requestAnimationFrame(Tick);

  };
  requestAnimationFrame(Tick);

  console.log("Working");
};

