precision mediump float;

struct DirectionalLignt{
  vec3 color;
vec3 direction;
};

varying vec2 fragTexCoord;
varying vec3 fragNormal;

uniform vec3 skyLightIntensity;
uniform DirectionalLignt directionalLight;

uniform sampler2D sampler;
void main(){
    vec3 surfaceNormal = normalize(fragNormal);
    vec3 sunDirectionNormal = normalize(directionalLight.direction);
  vec4 texture = texture2D(sampler,fragTexCoord);
  vec3 lightIntensity = skyLightIntensity + directionalLight.color * max(dot(fragNormal, sunDirectionNormal), 0.0);

  gl_FragColor = vec4(texture.rgb * lightIntensity, texture.a);
}
