/**
 * Shadow Map 
 * @author César Himura
 * @version 1.0
 */
class ShadowMapPipeline extends Pipeline {

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

            out vec2 o_texcoord;
            out vec3 o_normal;

            void main(){
                gl_Position = u_mProj * u_mView * u_mModel * vec4(in_position, 1.0);
                o_texcoord = in_texcoord;
                o_normal = in_normal;
            }
        `;
        
        var fragmentShaderSrc = `#version 300 es
            precision mediump float;
            //precision highp float;

            layout(location=0) out vec4 color;

            in vec2 o_texcoord;
            in vec3 o_normal;

            void main(){
                
                const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
                const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);

                vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift); // Calculate the value stored into each byte
                rgbaDepth -= rgbaDepth.gbaa * bitMask; // Cut off the value which do not fit in 8 bits
                
                //color = rgbaDepth;
                //color = vec4(1.0f, 0.0f, 0.0f, 1.0f);
                //color = rgbaDepth;
                //color = vec4(gl_FragCoord.z, gl_FragCoord.z, gl_FragCoord.z, 1.0f);
                color = vec4(gl_FragCoord.z, 0.0, 0.0, 1.0);
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

        uniforms.set("u_mProj", u_mProj);
        uniforms.set("u_mView", u_mView);
        uniforms.set("u_mModel", u_mModel);

        this.uniforms = uniforms;
    }

    /**
     * Use this pipeline
     */
    use(){
        super.use();
    }

    /**
     * Set program to null. To un use it.
     */
    unuse(){
        super.unuse();
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
     * 
     * @param {string} uniformName 
     * @param {Matrix4x4} matrix 
     */
    setMatrix(uniformName, matrix) {
        gl.uniformMatrix4fv(this.getUniformLocation(uniformName), false, matrix);
    }
}