/**
 * Pipeline to create custom pipelines and techniques to render
 * @author César Himura
 * @version 1.0
 */
class Pipeline {

    constructor(gl, vertexShaderSource, fragmentShaderSource, vertexFormat){
        this.gl = gl;
        this.vertexShader = webGLengine.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        this.fragmentShader = webGLengine.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = webGLengine.createProgram(gl, this.vertexShader, this.fragmentShader);

        this.vertexFormat = vertexFormat;

        this.name = "";
    }

    /**
     * Get the vertex shader of the pipeline
     * @returns {GLShader} vertex shader
     */
    getVertexShader(){
        return this.vertexShader;
    }

    /**
     * Get the fragment shader of the pipeline
     * @returns {GLShader} fragment shader
     */
    getFragmentShader(){
        return this.fragmentShader;
    }

    /**
     * Get the program
     * @returns {GLprogram} program that links the shaders
     */
    getProgram(){
        return this.program;
    }

    /**
     * Vertex fomat to conect with the vertex shader
     * @returns {Dictionary} vertex format of the shader
     */
    getVertexFormat(){
        return this.vertexFormat;
    }

    /**
     * Use this pipeline
     */
    use(){
        gl.useProgram(this.program);
    }

    /**
     * Un bound the program of the pipeline
     */
    unuse(){
        gl.useProgram(null);
    }

    /**
     * Set a uniform sampler in the shader.
     * @param {string} name Name of the uniform in the shader.
     * @param {int} value Value to pass to shader.
     */
    setUniformSampler(name, value) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, value);
        gl.uniform1i(this.getUniformLocation(name), 1);
    }

    /**
     * Set a uniform vector4 in the shader.
     * @param {string} name Name of the uniform in the shader.
     * @param {Vector4} value Value to pass to shader.
     */
    setUniformVector4(name, value){
        gl.uniform4fv(this.getUniformLocation(name), value);
    }

    /**
     * Set a uniform vector3 in the shader.
     * @param {string} name Name of the uniform in the shader.
     * @param {Vector3} value Value to pass to shader.
     */
    setUniformVector3(name, value){
        gl.uniform3fv(this.getUniformLocation(name), value);
    }

    /**
     * Set a uniform matrix4x4 in the shader.
     * @param {string} uniformName Name of the uniform in the shader.
     * @param {Matrix4x4} matrix Value to pass to shader.
     */
    setUniformMatrix4x4(uniformName, matrix){
        gl.uniformMatrix4fv(this.getUniformLocation(uniformName), false, matrix);
    }

    /**
     * Set a uniform float in the shader.
     * @param {string} name Name of the uniform in the shader.
     * @param {float} value Value to pass to shader.
     */
    setUniformFloat(name, value){
        gl.uniform1f(this.getUniformLocation(name), value);
    }

    /**
     * Set a uniform int in the shader.
     * @param {string} name Name of the uniform in the shader.
     * @param {int} value Value to pass to shader.
     */
    setUniformInt(name, value){
        gl.uniform1i(this.getUniformLocation(name), value);
    }
}