precision mediump float;

attribute vec3 vertPosition;

varying vec3 vertLoc;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main()
{
  vertLoc = vertPosition;
  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
