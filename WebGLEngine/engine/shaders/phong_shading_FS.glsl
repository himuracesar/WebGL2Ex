#version 300 es
precision mediump float;

in vec3 o_positionWV;
in vec3 o_normalWV;
in vec2 o_texcoord;

struct Material 
{
    vec4 diffuseColor;
    vec4 specularColor;
    vec4 ambientColor;
    vec4 emissiveColor;
    float specularPower;
    float transparency;
    float opticalDensity; 
    float roughness;
    float metallness;
};

struct DirectionalLight
{
    vec4 direction;
    vec4 color;
    int enabled;
    float intensity;
};

struct Lighting
{
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
};//48 bytes

uniform mat4 u_mProj;
uniform mat4 u_mView;
uniform mat4 u_mModel;
uniform vec3 u_camera_position;

layout(std140) uniform u_material {
    Material mat;
};

layout(std140) uniform u_directional_light {
    DirectionalLight dl;
};

uniform sampler2D u_sampler0;

out vec4 color;

vec4 GetAmbientLighting(vec4 color, vec4 ambientMaterial)
{
    return color * ambientMaterial;
}

/**
    * If the specular power is 1 the specular factor must be 0 in this way the specular lighting is 0            
    */
vec4 GetSpecularLighting(vec3 light, vec3 normal, vec3 viewDirection, vec4 color, vec4 specularMaterial, float specularPower)
{
    vec3 R = reflect(-light, normal);
    
    float specFactor = 0.0f;
    
    if(specularPower == 1.0f)
        specFactor = pow(max(dot(R, viewDirection), 0.0), specularPower);

    vec4 specLighting = color * specularMaterial * specFactor;
    return vec4(specLighting.xyz, 1.0f);
}

vec4 GetDiffuseLighting(vec3 light, vec3 normal, vec4 color, vec4 diffuseMaterial)
{
    normal = normalize(normal);
    float geometryTerm = max(0.0, dot(light, normal));

    return diffuseMaterial * geometryTerm * color;
}

Lighting ComputeDirectionalLight(DirectionalLight dl, Material material, vec3 normal, vec3 viewDirection)
{
    Lighting lighting;

    lighting.ambient = vec4(0.0f, 0.0f, 0.0f, 1.0f);
    lighting.diffuse = vec4(0.0f, 0.0f, 0.0f, 1.0f);
    lighting.specular = vec4(0.0f, 0.0f, 0.0f, 1.0f);
    
    mat4 mWorldView = u_mView * u_mModel;

    vec4 light = mWorldView * -dl.direction;
    light = normalize(light);
    
    lighting.diffuse = dl.intensity * GetDiffuseLighting(light.xyz, normal, dl.color, material.diffuseColor);
    
    lighting.specular = dl.intensity * GetSpecularLighting(light.xyz, normalize(normal), viewDirection, dl.color, material.specularColor, material.specularPower);
    
    lighting.ambient = GetAmbientLighting(dl.color, material.ambientColor);
    
    return lighting;
}

void main(){
    //vec3 u_camera_position = vec3(0.0,5, 100.0);

    //vec3 posWV = (u_mView * u_mModel * vec4(o_positionWV, 1.0f)).xyz;
    vec3 normalWV = normalize((u_mView * vec4(normalize(o_normalWV), 0.0f)).xyz);

    mat4 mWorldView = u_mView;// * u_mModel;

    vec4 cameraPosWV = mWorldView * vec4(u_camera_position, 1.0f);
    vec4 viewDirection = cameraPosWV - vec4(o_positionWV, 1.0f);

    Lighting l;
    l = ComputeDirectionalLight(dl, mat, normalize(o_normalWV), normalize(viewDirection.xyz));

    //color = texture(u_sampler0, vec2(o_texcoord.x, o_texcoord.y)) * (l.diffuse + /*l.specular +*/ l.ambient);
    color = texture(u_sampler0, vec2(o_texcoord.x, o_texcoord.y)) * (l.diffuse + l.specular + l.ambient);
    //color = l.specular;
}