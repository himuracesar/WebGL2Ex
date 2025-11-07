/**
 * To draw textures in orthogrphics projection
 * @author César Himura
 * @version 1.0
 */
class ScreenPipeline extends Pipeline {

    constructor(){
        var vertexShaderSrc = `#version 300 es
            layout(location=0) in vec3 in_position;
            layout(location=1) in vec2 in_texcoord;
            
            uniform mat4 u_mOrtho;
            uniform mat4 u_mModel;
            
            out vec2 o_texcoord;
            
            void main() {
                gl_Position = u_mOrtho *  u_mModel * vec4(in_position, 1.0f);
                o_texcoord = in_texcoord;
            }
        `;

        var fragmentShaderSrc = `#version 300 es
            precision highp float;
            
            in vec2 o_texcoord;
            
            uniform sampler2D u_texture;
            
            out vec4 color;
            
            void main() {
                color = texture(u_texture, o_texcoord);
            }
        `;
    
        let vertexFormat = { "in_position" : 3, "in_texcoord" : 2 };

        super(gl, vertexShaderSrc, fragmentShaderSrc, vertexFormat);

        let attributes = new Map();
        
        var in_position = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_position");
        var in_texcoord = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_texcoord");

        attributes.set("in_position", in_position);
        attributes.set("in_texcoord", in_texcoord);

        this.attributes = attributes;

        let uniforms = new Map();

        var u_mOrtho = gl.getUniformLocation(this.getProgram(), "u_mOrtho");
        var u_mModel = gl.getUniformLocation(this.getProgram(), "u_mModel");
        var u_texture = gl.getUniformLocation(this.getProgram(), "u_texture");

        uniforms.set("u_mOrtho", u_mOrtho);
        uniforms.set("u_mModel", u_mModel);
        uniforms.set("u_texture", u_texture);

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
     * @returns {GLprogram} program
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
     * Vertex fomat to conect with the vertex shader
     * @returns vertex format of the shader
     */
    getVertexFormat(){
        return this.vertexFormat;
    }
}