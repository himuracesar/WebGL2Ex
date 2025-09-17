/**
 * Cook Torrance shading - PBR
 * @author César Himura
 * @version 1.0
 */
class EdgesPipeline extends Pipeline {

    constructor(gl){
        var vertexShaderSrc = `#version 300 es
            precision mediump float;
            //precision highp float;

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
                //o_normalWV = in_normal;
                o_normalWV = (u_mView * u_mModel * vec4(in_normal, 0.0)).xyz;
                o_texcoord = in_texcoord;
            }
        `;
        
        var fragmentShaderSrc = `#version 300 es
            precision mediump float;
            //precision highp float;

            in vec3 o_positionWV;
            in vec3 o_normalWV;
            in vec2 o_texcoord;

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

            out vec4 color;

            void main(){
                vec3 edgeColor = vec3(0.0f, 1.0f, 0.0f);
                float edgeThickness = 0.3f;
                float edgeFalloff = 2.0f;

                camera.mWorldView = u_mView;

                //vec3 normalWV = normalize((camera.mWorldView * vec4(normalize(o_normalWV), 0.0f)).xyz);
                vec3 normalWV = normalize(o_normalWV);

                camera.cameraPosWV = camera.mWorldView * vec4(u_camera_position, 1.0f);
	            vec4 viewDirection = camera.cameraPosWV - vec4(o_positionWV, 1.0f);

                float NdotV = dot(normalWV, viewDirection.xyz);
    
                // Convertir a valor absoluto para obtener el factor de borde
                float edgeFactor = 1.0 - abs(NdotV);
                
                // Aplicar función de potencia para controlar la transición del borde
                edgeFactor = pow(edgeFactor, edgeFalloff);
                
                // Determinar si estamos en un borde basado en el grosor
                float edge = step(1.0 - edgeThickness, edgeFactor);
                
                // Mezclar color de borde con transparencia
                vec3 finalColor = edgeColor * edge;
                float alpha = edge;
                
                // Descartar fragmentos que no son bordes para mejor rendimiento
                if (alpha < 0.01) {
                    discard;
                }
                
                color = vec4(finalColor, alpha);
                //color = vec4(finalColor, 0.5f);
                //color = vec4(0.0f, 1.0f, 0.0f, 1.0f);
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

        uniforms.set("u_mProj", u_mProj);
        uniforms.set("u_mView", u_mView);
        uniforms.set("u_mModel", u_mModel);
        uniforms.set("u_camera_position", u_camera_position);

        this.uniforms = uniforms;
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
}