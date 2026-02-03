
/**
 * To draw the axis
 * @author César Himura
 * @version 1.0
 */
class AxisPipeline extends Pipeline {

    constructor(){
        var vertexShaderSrc = `#version 300 es
            layout(location = 0) in vec2 in_position;
            void main() {
                // Un quad que cubre toda la pantalla en Clip Space
                gl_Position = vec4(in_position, 0.0, 1.0);
            }
        `;

        var fragmentShaderSrc = `#version 300 es
            precision mediump float;
            out vec4 color;
            void main() {
                // Color magenta semitransparente para representar el Stencil
                color = vec4(1.0, 0.0, 1.0, 0.4); 
            }
        `;
    
        let vertexFormat = { "in_position" : 3, "in_color" : 4 };

        super(gl, vertexShaderSrc, fragmentShaderSrc, vertexFormat);

        let attributes = new Map();
        
        var in_position = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_position");

        attributes.set("in_position", in_position);

        this.attributes = attributes;

        let uniforms = new Map();

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

    /**
     * Set the uniform variable color in the shader
     * @param {Vector4} color 
     */
    setUniformLocationColor(color){
        gl.uniform4fv(this.getUniformLocation("u_color"), color);
    }
    
}