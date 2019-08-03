precision mediump float;


varying vec3 vertLoc;

void main(){
  gl_FragColor = vec4(vertLoc.z/2.0,0.5,vertLoc.z,1);
}
