class PhongShadingPipeline extends Pipeline {

    constructor(gl){
        var vertexShaderSrc = `#version 300 es
            precision mediump float;

            layout(location=0) in vec3 in_position;
            layout(location=1) in vec2 in_texcoord;
            layout(location=2) in vec3 in_normal;

            uniform mat4 u_mProj;
            uniform mat4 u_mView;
            uniform mat4 u_mModel;

            out vec3 o_positionWV;
            out vec3 o_normalWV;
            out vec2 o_texcoord;

            void main(){
                gl_Position = u_mProj * u_mView * u_mModel * vec4(in_position, 1.0);

                o_positionWV = (u_mView * u_mModel * vec4(in_position, 1.0)).xyz;
                o_normalWV = in_normal;
                o_texcoord = in_texcoord;
            }
        `;

        var fragmentShaderSrc = `#version 300 es
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

            struct PointLight
            {
                vec4 position;
                vec4 color;
                float kc; //Constant Attenuation
                float kl; //Linear Attenuation
                float kq; //Quadratic Attenuation
                float range;
                int enabled;
                float intensity;
            };

            struct Lighting
            {
                vec4 ambient;
                vec4 diffuse;
                vec4 specular;
            };//48 bytes

            struct Camera
            {
                vec4 cameraPosWV;
                mat4 mWorldView;
            };

            Camera camera;

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

            layout(std140) uniform u_point_light {
                PointLight pl;
            };

            uniform sampler2D u_sampler0;

            out vec4 color;

            float GetAttenuation(float kc, float kl, float kq, float distance)
            {
                return 1.0f / (kc + kl * distance + kq * distance * distance);
            }

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

            Lighting ComputePointLight(PointLight pl, Material material, vec3 position, vec3 normal, vec3 viewDirection)
            {
                Lighting lighting;

                lighting.ambient = vec4(0.0f, 0.0f, 0.0f, 0.0f);
                lighting.diffuse = vec4(0.0f, 0.0f, 0.0f, 0.0f);
                lighting.specular = vec4(0.0f, 0.0f, 0.0f, 0.0f);

                vec3 lightPosWV = (camera.mWorldView * pl.position).xyz;

                vec3 lightDirectionWV = lightPosWV - position;

                float d = length(lightDirectionWV);

                if (d > pl.range)
                {
                    return lighting;
                }

                lightDirectionWV /= d;
                //lightDirectionWV = normalize(lightDirectionWV);

                lighting.ambient = GetAmbientLighting(pl.color, material.ambientColor);

                normal = normalize(normal);
                lighting.diffuse = GetDiffuseLighting(lightDirectionWV, normal, pl.color * pl.intensity, material.diffuseColor);

                lighting.specular = GetSpecularLighting(lightDirectionWV, normal, normalize(viewDirection), pl.color * pl.intensity, material.specularColor, material.specularPower);

                float attenuation = GetAttenuation(pl.kc, pl.kl, pl.kq, d);

                lighting.diffuse *= attenuation;
                lighting.specular *= attenuation;

                return lighting;
            }

            void main(){
                vec3 normalWV = normalize((u_mView * vec4(normalize(o_normalWV), 0.0f)).xyz);

                camera.mWorldView = u_mView;// * u_mModel;

                camera.cameraPosWV = camera.mWorldView * vec4(u_camera_position, 1.0f);
	            vec4 viewDirection = camera.cameraPosWV - vec4(o_positionWV, 1.0f);

                Lighting lighting;
                lighting.ambient = vec4(0.0f, 0.0f, 0.0f, 1.0f);
                lighting.diffuse = vec4(0.0f, 0.0f, 0.0f, 1.0f);
                lighting.specular = vec4(0.0f, 0.0f, 0.0f, 1.0f);
                
                if(dl.enabled > 0){
                    Lighting l = ComputeDirectionalLight(dl, mat, normalize(o_normalWV), normalize(viewDirection.xyz));
                    lighting.diffuse += l.diffuse;
                    lighting.specular += l.specular;
                    lighting.ambient += l.ambient;
                }

                if(pl.enabled > 0){
                    Lighting l;
                    l = ComputePointLight(pl, mat, o_positionWV, normalize(o_normalWV), normalize(viewDirection.xyz));
                    lighting.diffuse += l.diffuse;
                    lighting.specular += l.specular;
                    lighting.ambient += l.ambient;
                }

                color = texture(u_sampler0, vec2(o_texcoord.x, o_texcoord.y)) * (lighting.diffuse + lighting.specular + lighting.ambient);
                //color = pl.color;
                //color = lighting.diffuse;
            }
        `;
    
        let vertexFormat = { "in_position" : 3, "in_texcoord" : 2, "in_normal" : 3 };

        super(gl, vertexShaderSrc, fragmentShaderSrc, vertexFormat);

        let attributes = new Map();
       
        var in_position = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_position");
        var in_texcoord = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_texcoord");
        var in_normal = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_normal");

        attributes.set("in_position", in_position);
        attributes.set("in_texcoord", in_texcoord);
        attributes.set("in_normal", in_normal);

        this.attributes = attributes;

        let uniforms = new Map();

        var u_mProj = gl.getUniformLocation(this.getProgram(), "u_mProj");
        var u_mView = gl.getUniformLocation(this.getProgram(), "u_mView");
        var u_mModel = gl.getUniformLocation(this.getProgram(), "u_mModel");
        var u_camera_position = gl.getUniformLocation(this.getProgram(), "u_camera_position");
        var u_sampler0 = gl.getUniformLocation(this.getProgram(), "u_sampler0");

        uniforms.set("u_mProj", u_mProj);
        uniforms.set("u_mView", u_mView);
        uniforms.set("u_mModel", u_mModel);
        uniforms.set("u_sampler0", u_sampler0);
        uniforms.set("u_camera_position", u_camera_position);

        this.uniforms = uniforms;

        this.lightsIndex = 1;
    }

    /**
     * Use this pipeline
     */
    use(){
        super.use();
    }

    /**
     * Get the program that links the shaders
     * @returns {WebGLProgram} program
     */
    getProgram(){
        return super.getProgram();
    }

    /**
     * Get the attribute location of the shaders
     * @param {string} attribute Name of the attribute
     * @returns {GLint} attribute location
     */
    getAttributeLocation(attribute){
        return this.attributes.get(attribute);
    }

    /**
     * Get the uniform location of the shaders
     * @param {string} uniform Name of the uniform
     * @returns {GLint} uniform location
     */
    getUniformLocation(uniform){
        return this.uniforms.get(uniform);
    }

    /**
     * Vertex format to conect with the vertex shader
     * @returns {dictionary} vertex format of the shader
     */
    getVertexFormat(){
        return this.vertexFormat;
    }

    /**
     * Get the index of lights uniform shader
     * @returns {int} lights index
     */
    getLightsIndex(){
        return this.lightsIndex;
    }
    
}