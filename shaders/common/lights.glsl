
// see https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual

struct Light {
    vec3 position;     // For point and spot lights
    vec3 direction;    // For directional and spot lights
    vec3 color;
    float intensity;
    float range;       // For point and spot lights
    float spotAngle;   // For spot lights
    float spotExponent; // For spot lights
    int type;          // 0 = directional, 1 = point, 2 = spot
    int shadows;
    int shadowMapIndex; // Index of the shadow map
};

const int LightType_Directional = 0;
const int LightType_Point = 1;
const int LightType_Spot = 2;
const float toon_color_levels = 4.0;
const float toon_scale_factor = 1.0 / toon_color_levels;

uniform Light u_Lights[10]; //More Lights Less performance ...
uniform int u_LightCount;

//shadows related shit
uniform sampler2D u_ShadowMap0;
uniform sampler2D u_ShadowMap1;
uniform sampler2D u_ShadowMap2;

uniform samplerCube u_ShadowCubeMap0;
uniform samplerCube u_ShadowCubeMap1;
uniform samplerCube u_ShadowCubeMap2;

uniform mat4 u_LightSpaceMatrices[10];

vec3 calculateDirectionalLightDiffuse(Light light, vec3 normal) {
    vec3 lightDir = normalize(-light.direction);
    float diff = max(dot(normal, lightDir), 0.0);
    return diff * light.color * light.intensity;
}

vec3 calculateDirectionalLightDiffuseToon(Light light, vec3 normal) {
    vec3 lightDir = normalize(-light.direction);
    float diff = max(dot(normal, lightDir), 0.0);
    diff = ceil(diff * toon_color_levels) * toon_scale_factor;
    return diff * light.color * light.intensity;
}

vec3 calculateDirectionalLightSpecular(Light light, vec3 normal, vec3 viewDir) {
    vec3 lightDir = normalize(-light.direction);
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    return spec * light.color * light.intensity;
}

vec3 calculatePointLightDiffuse(Light light, vec3 fragPos, vec3 normal) {
    vec3 lightDir = normalize(light.position - fragPos);
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * (distance * distance));

    float diff = max(dot(normal, lightDir), 0.0);
    return diff * light.color * light.intensity * attenuation;
}

vec3 calculatePointLightDiffuseToon(Light light, vec3 fragPos, vec3 normal) {
    vec3 lightDir = normalize(light.position - fragPos);
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * (distance * distance));

    float diff = max(dot(normal, lightDir), 0.0);
    diff = ceil(diff * toon_color_levels) * toon_scale_factor;
    return diff * light.color * light.intensity * attenuation;
}

vec3 calculatePointLightSpecular(Light light, vec3 fragPos, vec3 normal, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - fragPos);
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * (distance * distance));

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    return spec * light.color * light.intensity * attenuation;
}

vec3 calculateSpotLightDiffuse(Light light, vec3 fragPos, vec3 normal) {
    vec3 lightDir = normalize(light.position - fragPos);
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * (distance * distance));

    float theta = dot(lightDir, normalize(-light.direction));
    float epsilon = light.spotAngle - light.spotExponent;
    float intensity = clamp((theta - light.spotExponent) / epsilon, 0.0, 1.0);

    float diff = max(dot(normal, lightDir), 0.0);
    return diff * light.color * light.intensity * attenuation * intensity;
}

vec3 calculateSpotLightDiffuseToon(Light light, vec3 fragPos, vec3 normal) {
    vec3 lightDir = normalize(light.position - fragPos);
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * (distance * distance));

    float theta = dot(lightDir, normalize(-light.direction));
    float epsilon = light.spotAngle - light.spotExponent;
    float intensity = clamp((theta - light.spotExponent) / epsilon, 0.0, 1.0);

    float diff = max(dot(normal, lightDir), 0.0);
    diff = ceil(diff * toon_color_levels) * toon_scale_factor;
    return diff * light.color * light.intensity * attenuation * intensity;
}

vec3 calculateSpotLightSpecular(Light light, vec3 fragPos, vec3 normal, vec3 viewDir) {
    vec3 lightDir = normalize(light.position - fragPos);
    float distance = length(light.position - fragPos);
    float attenuation = 1.0 / (1.0 + 0.09 * distance + 0.032 * (distance * distance));

    float theta = dot(lightDir, normalize(-light.direction));
    float epsilon = light.spotAngle - light.spotExponent;
    float intensity = clamp((theta - light.spotExponent) / epsilon, 0.0, 1.0);

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    return spec * light.color * light.intensity * attenuation * intensity;
}

float ShadowCalculation(vec4 fragPosLightSpace, int shadowMapIndex) {
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;

    float closestDepth;
    if(shadowMapIndex == 0)
        closestDepth = texture(u_ShadowMap0, projCoords.xy).r;
    else if(shadowMapIndex == 1)
        closestDepth = texture(u_ShadowMap1, projCoords.xy).r;
    else if(shadowMapIndex == 2)
        closestDepth = texture(u_ShadowMap2, projCoords.xy).r;

    float currentDepth = projCoords.z;
    float bias = 0.005;
    float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
    return shadow;
}

float ShadowCalculationPoint(vec3 fragPos, vec3 lightPos, int shadowMapIndex, float farPlane) {

    vec3 fragToLight = fragPos - lightPos;
    float currentDepth = length(fragToLight);
    float bias = 0.005;
    float closestDepth;
    if(shadowMapIndex == 0)
        closestDepth = texture(u_ShadowCubeMap0, fragToLight).r * farPlane;
    else if(shadowMapIndex == 1)
        closestDepth = texture(u_ShadowCubeMap1, fragToLight).r * farPlane;
    else if(shadowMapIndex == 2)
        closestDepth = texture(u_ShadowCubeMap2, fragToLight).r * farPlane;

    float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
    return shadow;
}

float rimLightIntensityFactor(vec3 normal, vec3 viewDir) {
    float rimLightFacor = max(0.0, 1.0 - dot(viewDir, normal));

    rimLightFacor = pow(rimLightFacor, 4.0);

    rimLightFacor = smoothstep(0.3, 0.4, rimLightFacor);

    return rimLightFacor;
}
