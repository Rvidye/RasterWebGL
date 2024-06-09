
// see https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual

struct Light
{
    vec3 position;     // For point and spot lights
    vec3 direction;    // For directional and spot lights
    vec3 color;
    float intensity;
    float range;       // For point and spot lights
    float spotAngle;   // For spot lights
    float spotExponent; // For spot lights
    int type;          // 0 = directional, 1 = point, 2 = spot
};

const int LightType_Directional = 0;
const int LightType_Point = 1;
const int LightType_Spot = 2;
const float toon_color_levels = 4.0;
const float toon_scale_factor = 1.0 / toon_color_levels;

uniform Light u_Lights[10]; //More Lights Less performance ...
uniform int u_LightCount;

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

