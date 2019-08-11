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
Bounces = '100';
var tracerFragmentSource =
  "precision highp float;" +
  "uniform vec3 eye;" +
  " varying vec3 initialRay;" +
  " uniform float textureWeight;" +
  " uniform float timeSinceStart;" +
  " uniform sampler2D texture;" +
  " uniform float glossiness;" +
  " vec3 roomCubeMin = vec3(-1.0, -1.0, -1.0);" +
  " vec3 roomCubeMax = vec3(1.0, 1.0, 1.0);" +
  "uniform vec3 light; uniform vec3 cubeMin4;" +
  " uniform vec3 cubeMax4;" +
  " vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {" +
  " vec3 tMin = (cubeMin - origin) / ray;" +
  "vec3 tMax = (cubeMax - origin) / ray;" +
  "   vec3 t1 = min(tMin, tMax);" +
  "   vec3 t2 = max(tMin, tMax); " +
  "  float tNear = max(max(t1.x, t1.y), t1.z);" +
  "   float tFar = min(min(t2.x, t2.y), t2.z);" +
  "   return vec2(tNear, tFar); " +
  "} " +
  "vec3 normalForCube(vec3 hit, vec3 cubeMin, vec3 cubeMax) {   " +
  "if(hit.x < cubeMin.x + 0.0001) return vec3(-1.0, 0.0, 0.0);   " +
  "else if(hit.x > cubeMax.x - 0.0001) return vec3(1.0, 0.0, 0.0);" +
  "   else if(hit.y < cubeMin.y + 0.0001) return vec3(0.0, -1.0, 0.0);" +
  "   else if(hit.y > cubeMax.y - 0.0001) return vec3(0.0, 1.0, 0.0);" +
  "   else if(hit.z < cubeMin.z + 0.0001) return vec3(0.0, 0.0, -1.0);" +
  "   else return vec3(0.0, 0.0, 1.0);" +
  " } float intersectSphere(vec3 origin, vec3 ray, vec3 sphereCenter, float sphereRadius) {" +
  "   vec3 toSphere = origin - sphereCenter;" +
  "   float a = dot(ray, ray);" +
  "   float b = 2.0 * dot(toSphere, ray);" +
  "   float c = dot(toSphere, toSphere) - sphereRadius*sphereRadius;" +
  "   float discriminant = b*b - 4.0*a*c; " +
  "  if(discriminant > 0.0) {" +
  "     float t = (-b - sqrt(discriminant)) / (2.0 * a);" +
  "     if(t > 0.0) return t;  " +
  " }   return 10000.0;" +
  " } vec3 normalForSphere(vec3 hit, vec3 sphereCenter, float sphereRadius) {  " +
  " return (hit - sphereCenter) / sphereRadius;" +
  " } float random(vec3 scale, float seed) {" +
  "   return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed); " +
  "} " +
  "vec3 cosineWeightedDirection(float seed, vec3 normal) { " +
  "  float u = random(vec3(12.9898, 78.233, 151.7182), seed); " +
  "  float v = random(vec3(63.7264, 10.873, 623.6736), seed); " +
  "  float r = sqrt(u);" +
  "   float angle = 6.283185307179586 * v;" +
  "   vec3 sdir, tdir;   if (abs(normal.x)<.5) { " +
  "    sdir = cross(normal, vec3(1,0,0));   }" +
  " else { " +
  "    sdir = cross(normal, vec3(0,1,0));" +
  "   }   " +
  "tdir = cross(normal, sdir);" +
  "   return r*cos(angle)*sdir + r*sin(angle)*tdir + sqrt(1.-u)*normal; " +
  "} " +
  "vec3 uniformlyRandomDirection(float seed) { " +
  "  float u = random(vec3(12.9898, 78.233, 151.7182), seed);" +
"   float v = random(vec3(63.7264, 10.873, 623.6736), seed);" +
"   float z = 1.0 - 2.0 * u;" +
"   float r = sqrt(1.0 - z * z);" +
"   float angle = 6.283185307179586 * v;" +
  "   return vec3(r * cos(angle), r * sin(angle), z); } " +
  "vec3 uniformlyRandomVector(float seed) {   return uniformlyRandomDirection(seed) * sqrt(random(vec3(36.7539, 50.3658, 306.2759), seed)); } " +
  "float shadow(vec3 origin, vec3 ray) { vec2 tCube4 = intersectCube(origin, ray, cubeMin4, cubeMax4); if(tCube4.x > 0.0 && tCube4.x < 1.0 && tCube4.x < tCube4.y) return 0.0;   return 1.0; } " +
  "vec3 calculateColor(vec3 origin, vec3 ray, vec3 light) { " +
  "  vec3 colorMask = vec3(1.0);   " +
  "  vec3 accumulatedColor = vec3(0.0);   " +
  "for(int bounce = 0; bounce < "+Bounces +"; bounce++) { " +
  "  vec2 tRoom = intersectCube(origin, ray, roomCubeMin, roomCubeMax); " +
  "vec2 tCube4 = intersectCube(origin, ray, cubeMin4, cubeMax4);" +
  " float t = 10000.0;" +
  "  if(tRoom.x < tRoom.y) t = tRoom.y;" +
  "if(tCube4.x > 0.0 && tCube4.x < tCube4.y && tCube4.x < t) t = tCube4.x;" +
  "     vec3 hit = origin + ray * t;     vec3 surfaceColor = vec3(0.75); " +
  "    float specularHighlight = 0.0;" +
  "     vec3 normal;" +
  "     if(t == tRoom.y) {  " +
  "     normal = -normalForCube(hit, roomCubeMin, roomCubeMax);" +
  " if(hit.x < -0.9999) surfaceColor = vec3(0.1, 0.5, 1.0);" +
  " else if(hit.x > 0.9999) surfaceColor = vec3(0.0, 0.9, 0.1); " +
  "ray = uniformlyRandomDirection(timeSinceStart);" +
  "     } else if(t == 10000.0) {" +
  "       break;    " +
  " } else { " +
  "      if(false) ;" +
  " else " +
  "if(t == tCube4.x && tCube4.x < tCube4.y){" +
  " normal = normalForCube(hit, cubeMin4, cubeMax4); if(hit.x<cubeMin4.x + 0.001) surfaceColor = vec3(1.0,0.0,0.0);" +
  " }" +
  "ray = reflect(ray, normal);" +
  " vec3 reflectedLight = normalize(reflect(light - hit, normal));" +
  " specularHighlight = max(0.0, dot(reflectedLight, normalize(hit - origin)));" +
  " specularHighlight = 2.0 * pow(specularHighlight, 20.0);" +
  "     }" +
  "     vec3 toLight = light - hit;" +
  "     float diffuse = max(0.0, dot(normalize(toLight), normal));" +
  "     float shadowIntensity = shadow(hit + normal * 0.0001, toLight);" +
  "     colorMask *= surfaceColor;" +
  "     accumulatedColor += colorMask * (0.5 * diffuse * shadowIntensity);" +
  "     accumulatedColor += colorMask * specularHighlight * shadowIntensity;" +
  "     origin = hit;   }" +
  "   return accumulatedColor;" +
  " } " +
  "void main() " +
  "{" +
  "   vec3 newLight = light + uniformlyRandomVector(timeSinceStart - 53.0) * 0.1;" +
  "   vec3 texture = texture2D(texture, gl_FragCoord.xy / 512.0).rgb;" +
  "   gl_FragColor = vec4(mix(calculateColor(eye, initialRay, newLight), texture, textureWeight), 1.0);" +
  " }";

var gl;
var ui;
var renderer;
var pathTracer;
var error;
var canvas;
var inputFocusCount = 0;

var angleX = 0;
var angleY = 0;
var zoomZ = 2.5;
var eye = Vector.create([0, 0, 0]);
var light = Vector.create([0.4, 0.5, -0.6]);

var nextObjectId = 0;

var MATERIAL_DIFFUSE = 0;
var MATERIAL_MIRROR = 1;
var MATERIAL_GLOSSY = 2;
var material = MATERIAL_MIRROR;
var glossiness = 0.6;

var YELLOW_BLUE_CORNELL_BOX = 0;
var RED_GREEN_CORNELL_BOX = 1;
var environment = YELLOW_BLUE_CORNELL_BOX;

var objects = [];

var Initialize = function () {
  gl = null;
  canvas = document.getElementById('gameFrame');
  gl = canvas.getContext('webgl');
  if(!gl){
    console.log("Does Not support Webgl");
    return;
  }
  //Path Teacer = new PathTracer();

  var pathTracerVertices = [
    -1, -1,
    -1, +1,
    +1, -1,
    +1, +1
  ];

  var pathTracerVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,pathTracerVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pathTracerVertices),gl.STATIC_DRAW);

  var pathTracerFrameBuffer = gl.createFramebuffer();

  var pathTracerType = gl.getExtension('OES_texture_float') ? gl.FLOAT : gl.UNSIGNED_BYTE;
  var pathTracerTextures = [];

  for(var i =0; i< 2; i++){
    pathTracerTextures.push(gl.createTexture());
    gl.bindTexture(gl.TEXTURE_2D,pathTracerTextures[i]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, pathTracerType, null);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);


  var pathTracerVertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(pathTracerVertexShader,renderVertexSource);
  gl.compileShader(pathTracerVertexShader);
  if(!gl.getShaderParameter(pathTracerVertexShader,gl.COMPILE_STATUS)){
    console.log("Compile error" + gl.getShaderInfoLog(pathTracerVertexShader));
    return;
  }

  var pathTracerFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(pathTracerFragmentShader,renderFragmentSource);
  gl.compileShader(pathTracerFragmentShader);
  if(!gl.getShaderParameter(pathTracerFragmentShader,gl.COMPILE_STATUS)){
    console.log("Compile error" + gl.getShaderInfoLog(pathTracerFragmentShader));
    return;
  }


  var pathTracerRenderProgram = gl.createProgram();
  gl.attachShader(pathTracerRenderProgram,pathTracerVertexShader);
  gl.attachShader(pathTracerRenderProgram,pathTracerFragmentShader);
  gl.linkProgram(pathTracerRenderProgram);
  if(!gl.getProgramParameter(pathTracerRenderProgram,gl.LINK_STATUS)){
    console.log("Link Error" + gl.getProgramInfoLog(pathTracerRenderProgram));
    return;
  }

  var pathTracerRenderVertexAttrib = gl.getAttribLocation(pathTracerRenderProgram,'vertex');
  gl.enableVertexAttribArray(pathTracerRenderVertexAttrib);

  var pathTracerObjects = []
  var sampleCount = 0;
  var pathTracerTracerProgram = null;

  //ui.setObjects()...;
  var Cube = {
    minCorner : Vector.create([-0.25,-0.25,-0.25]),
    maxCorner : Vector.create([0.25,0.25,0.25]),
    id: 0
  };

  objects.push(Cube);

  var Light = {
    temporaryTranslation: [0,0,0]
  };

  objects.splice(0,0,Light);
  pathTracerObjects = objects;
  sampleCount = 0;
  var pathTracerUniform = {};
  var rendererUniform = {};

  var pathTracerTracerVertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(pathTracerTracerVertexShader,tracerVertexSource);
  gl.compileShader(pathTracerTracerVertexShader);
  if(!gl.getShaderParameter(pathTracerTracerVertexShader,gl.COMPILE_STATUS)){
    console.log("Compile error" + gl.getShaderInfoLog(pathTracerTracerVertexShader));
    return;
  }

  var pathTracerTracerFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(pathTracerTracerFragmentShader,tracerFragmentSource);
  gl.compileShader(pathTracerTracerFragmentShader);
  if(!gl.getShaderParameter(pathTracerTracerFragmentShader,gl.COMPILE_STATUS)){
    console.log("Compile error" + gl.getShaderInfoLog(pathTracerTracerFragmentShader));
    return;
  }


  var pathTracerTracerProgram = gl.createProgram();
  gl.attachShader(pathTracerTracerProgram,pathTracerTracerVertexShader);
  gl.attachShader(pathTracerTracerProgram,pathTracerTracerFragmentShader);
  gl.linkProgram(pathTracerTracerProgram);
  if(!gl.getProgramParameter(pathTracerTracerProgram,gl.LINK_STATUS)){
    console.log("Link Error" + gl.getProgramInfoLog(pathTracerTracerProgram));
    return;
  }

  var pathTracerTracerVertexArrib = gl.getAttribLocation(pathTracerTracerProgram,'vertex');
  gl.enableVertexAttribArray(pathTracerTracerVertexArrib);

  var start = new Date();

  var tick = function(time){
    // temp = document.getElementById("angle").value;
    // if(temp!==angleY){
    //   sampleCount = 0;
    //   angleY = temp;
    // }

    eye.elements[0] = zoomZ * Math.sin(angleY) * Math.cos(angleX);
    eye.elements[1] = zoomZ * Math.sin(angleX);
    eye.elements[2] = zoomZ * Math.cos(angleY) * Math.cos(angleX);

    var modelview = makeLookAt(eye.elements[0], eye.elements[1], eye.elements[2], 0, 0, 0, 0, 1, 0);
    var projection = makePerspective(55, 1, 0.1, 100);
    var modelviewProjection = projection.multiply(modelview);
    var jitter = Matrix.Translation(Vector.create([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]).multiply(1 / 512));
    var t = jitter.multiply(modelviewProjection);
    var inverse = t.inverse();

    pathTracerUniform['light'] = light.add(Light.temporaryTranslation);
    pathTracerUniform['cubeMin4'] = Cube.minCorner;
    pathTracerUniform['cubeMax4'] = Cube.maxCorner;
    pathTracerUniform.eye = eye;
    pathTracerUniform.glossiness = glossiness;
    pathTracerUniform.ray00 = getEyeRay(inverse, -1, -1);
    pathTracerUniform.ray01 = getEyeRay(inverse, -1, +1);
    pathTracerUniform.ray10 = getEyeRay(inverse, +1, -1);
    pathTracerUniform.ray11 = getEyeRay(inverse, +1, +1);
    pathTracerUniform.timeSinceStart = time;
    pathTracerUniform.textureWeight = sampleCount / (sampleCount + 1);

    gl.useProgram(pathTracerTracerProgram);
    setUniforms(pathTracerTracerProgram, pathTracerUniform);
    gl.useProgram(pathTracerTracerProgram);
    gl.bindTexture(gl.TEXTURE_2D,pathTracerTextures[0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, pathTracerVertexBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER,pathTracerFrameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,pathTracerTextures[1],0);
    gl.vertexAttribPointer(pathTracerRenderVertexAttrib,2,gl.FLOAT, false,0,0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    pathTracerTextures.reverse();
    sampleCount++;

    //RENDER

    gl.useProgram(pathTracerRenderProgram);
    gl.bindTexture(gl.TEXTURE_2D,pathTracerTextures[0]);
    gl.bindBuffer(gl.ARRAY_BUFFER,pathTracerVertexBuffer);
    gl.vertexAttribPointer(pathTracerRenderVertexAttrib,2,gl.FLOAT,false,0,0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

    requestAnimationFrame(function () {
      tick((new Date() - start)/1000);});

  };


  requestAnimationFrame(function () {
    tick((new Date() - start)/1000);});




};
