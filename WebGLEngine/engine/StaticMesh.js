/**
 * Static Mesh or 3D model
 * @author César Himura
 * @version 1.0
 */
class StaticMesh {

    /**
     * Create a Static Mesh
     * @param {WebGL2RenderingContext} gl Context of WebGL to render
     */
    constructor(){
        //gl = gl;
        this.submeshes = [];
        this.vao = gl.createVertexArray();
        this.vertexFormat = {};
        this.vertexByRow = 0;
        this.forward = [0.0, 0.0, -1.0];
        this.right = [1.0, 0.0, 0.0];
        this.up = [0.0, 1.0, 0.0];
        this.position = [0.0, 0.0, 0.0];
        this.scale = [1.0, 1.0, 1.0];
        this.yRotation = 0.0;
        this.xRotation = 0.0;
        this.zRotation = 0.0;
        this.materials = [];
    }

    /**
     * Draw the mesh with by indices or vertices it depends on the model
     * @param {Pipeline} pipeline Pipiline to render
     */
    render(pipeline){
        
        pipeline.use();

        var mModel = m4.translation(this.position[0], this.position[1], this.position[2]);
        mModel = m4.multiply(mModel, m4.yRotation(this.yRotation));
        mModel = m4.multiply(mModel, m4.xRotation(this.xRotation));
        mModel = m4.multiply(mModel, m4.zRotation(this.zRotation));
        mModel = m4.multiply(mModel, m4.scaling(this.scale[0], this.scale[1], this.scale[2]));

        this.forward = m4.transformVector(mModel, [0.0, 0.0, -1.0, 0.0]);
        this.right = m4.transformVector(mModel, [1.0, 0.0, 0.0, 0.0]);
        this.up = m4.transformVector(mModel, [0.0, 1.0, 0.0, 0.0]);

        gl.uniformMatrix4fv(pipeline.getUniformLocation("u_mModel"), false, mModel);
        
        gl.bindVertexArray(this.vao);
        
        for(var i = 0; i < this.submeshes.length; i++){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.submeshes[i].getVertexBuffer());

            /**
             * It's important vertexAttribPointer and enableVertexAttribArray are inside of bindVertexArray to correct render
             */
            var offset = 0;
            for (const [key, value] of Object.entries(this.vertexFormat)) {
                //console.log(key, value);
                gl.vertexAttribPointer(pipeline.getAttributeLocation(key), value, gl.FLOAT, gl.FALSE, this.vertexByRow * Float32Array.BYTES_PER_ELEMENT, offset * Float32Array.BYTES_PER_ELEMENT);
                gl.enableVertexAttribArray(pipeline.getAttributeLocation(key));

                offset += value;
            }
            
            if(this.submeshes[i].getNumIndices() > 0){
                gl.drawElements(gl.TRIANGLES, this.submeshes[i].getNumIndices(), gl.UNSIGNED_SHORT, 0);
            }
            else{
                gl.drawArrays(gl.TRIANGLES, 0, this.submeshes[i].getNumVertices());
            }

            for (const [key, value] of Object.entries(this.vertexFormat)) {
                gl.disableVertexAttribArray(pipeline.getAttributeLocation(key));
            }
        }

        gl.bindVertexArray(null);
        gl.useProgram(null);
    }

    /**
     * Add a submesh to the mesh
     * @param {Submesh} sm Submesh
     */
    addSubmesh(sm){
        this.submeshes.push(sm);
    }

    /**
     * Get Vertex Array Object
     * @returns the vertex array object of the mesh
     */
    getVao(){
        return this.vao;
    }

    /**
     * Set the vertex format
     * @param {Dictionary} vf Format of the model's vertices. It must match with the vertex format of the pipeline
     */
    setVertexFormat(vf){
        this.vertexFormat = vf;
        for (const [key, value] of Object.entries(vf)) {
            this.vertexByRow += value;
        }
    }

    /**
     * Set the position
     * @param {array} position position of the mesh
     */
    setPosition(position){
        this.position = position;
    }

    /**
     * Get the position
     * @returns the position
     */
    getPosition(){
        return this.position;
    }

    /**
     * Rotate in Y axis
     * @param {float} angle angle to rotate
     */
    rotateY(angle){
        this.yRotation = angle;
    }

    /**
     * Rotate in X axis
     * @param {float} angle angle to rotate
     */
    rotateX(angle){
        this.xRotation = angle;
    }

    /**
     * Rotate in Z axis
     * @param {float} angle angle to rotate
     */
    rotateZ(angle){
        this.zRotation = angle;
    }

    /**
     * Scale the model
     * @param {array} scale 
     */
    scale(scale){
        this.scale = scale;
    }

    /**
     * Add a material
     * @param {Material} material 
     */
    addMaterial(material){
        this.materials.push(material);
    }

    getNumMaterials() {
        return this.materials.length;
    }
}