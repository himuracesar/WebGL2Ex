
/**
 * To draw the axis
 * @author César Himura
 * @version 1.0
 */
class AxisPipeline extends Pipeline {

    constructor(){
        var vertexShaderSrc = `#version 300 es
            precision highp float;

            layout(location=0) in vec3 in_position;
            layout(location=1) in vec4 in_color;
            layout(location=2) in mat4 in_mModel;

            uniform mat4 u_mProj;
            uniform mat4 u_mView;
            //uniform mat4 u_mModel;

            flat out int v_instanceID; // Enviamos el ID al Fragment Shader

            out vec4 out_color;

            void main(){
                v_instanceID = gl_InstanceID; // Capturamos el ID built-in

                // 1. Obtener posición en View Space para saber la distancia a la cámara
                vec4 viewPos = u_mView * in_mModel * vec4(0.0, 0.0, 0.0, 1.0);
                float dist = length(viewPos.xyz);
                
                // 2. Escalar el vértice según la distancia
                float scale = dist * 0.0020; // Ajusta 0.15 según el tamaño deseado
                
                // 3. Aplicar transformación (manteniendo el gizmo orientado al objeto)
                gl_Position = u_mProj * u_mView * in_mModel * vec4(in_position * scale, 1.0);
                out_color = in_color;
            }
        `;

        var fragmentShaderSrc = `#version 300 es
            precision highp float;

            in vec4 out_color;
            flat in int v_instanceID; // Recibimos el ID desde el Vertex Shader

            out vec4 color;

            void main(){
                color = out_color;
                // En lugar de usar in_color, usa el ID de instancia para debuguear
                /*vec3 debugColor = vec3(0.0);
                if(v_instanceID == 0) debugColor = vec3(1.0, 0.0, 0.0); // Rojo
                if(v_instanceID == 1) debugColor = vec3(0.0, 1.0, 0.0); // Verde
                if(v_instanceID == 2) debugColor = vec3(0.0, 0.0, 1.0); // Azul
                color = vec4(debugColor, 1.0);*/
            }
        `;
    
        let vertexFormat = { "in_position" : 3 };

        super(gl, vertexShaderSrc, fragmentShaderSrc, vertexFormat);

        let attributes = new Map();
        
        var in_position = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_position");
        var in_color = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_color");
        var in_mModel = webGLengine.getAttributeLocation(gl, this.getProgram(), "in_mModel");

        attributes.set("in_position", in_position);
        attributes.set("in_color", in_color);
        attributes.set("in_mModel", in_mModel);

        this.attributes = attributes;

        let uniforms = new Map();

        var u_mProj = gl.getUniformLocation(this.getProgram(), "u_mProj");
        var u_mView = gl.getUniformLocation(this.getProgram(), "u_mView");
        //var u_mModel = gl.getUniformLocation(this.getProgram(), "u_mModel");
        //var u_color = gl.getUniformLocation(this.getProgram(), "u_color");

        uniforms.set("u_mProj", u_mProj);
        uniforms.set("u_mView", u_mView);
        //uniforms.set("u_mModel", u_mModel);
        //uniforms.set("u_color", u_color);

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