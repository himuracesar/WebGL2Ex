/**
 * Static Mesh or 3D model
 * @author César Himura
 * @version 1.0
 */
class StaticMesh {

    /**
     * Create a Static Mesh
     */
    constructor(){
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
        this.textures = [];
        this.axisRotation = [
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ];
    }

    /**
     * Draw the mesh with by indices or vertices it depends on the model
     * @param {Pipeline} pipeline Pipiline to render
     * @param {RenderMode enum} mode Render mode. Triangles is the default mode.
     */
    render(pipeline, mode = RenderMode.Triangles){
        
        pipeline.use();

        var mModel = m4.translation(this.position[0], this.position[1], this.position[2]);
        mModel = m4.multiply(mModel, m4.yRotation(this.yRotation));
        mModel = m4.multiply(mModel, m4.xRotation(this.xRotation));
        mModel = m4.multiply(mModel, m4.zRotation(this.zRotation));
        mModel = m4.multiply(mModel, m4.scaling(this.scale[0], this.scale[1], this.scale[2]));
        mModel = m4.multiply(mModel, this.axisRotation);
        
        //var mModel = m4.identity();

        this.forward = m4.transformVector(mModel, [0.0, 0.0, -1.0, 0.0]);
        this.right = m4.transformVector(mModel, [1.0, 0.0, 0.0, 0.0]);
        this.up = m4.transformVector(mModel, [0.0, 1.0, 0.0, 0.0]);

        gl.uniformMatrix4fv(pipeline.getUniformLocation("u_mModel"), false, mModel);

        gl.bindVertexArray(this.vao);
        
        for(var i = 0; i < this.submeshes.length; i++){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.submeshes[i].getVertexBuffer());
            
            /**
             * It's important vertexAttribPointer and enableVertexAttribArray are inside of bindVertexArray to rendering in a correct way
             */
            var offset = 0;
            for (const [key, value] of Object.entries(this.vertexFormat)) {
                //console.log(key, value);
                gl.vertexAttribPointer(
                    pipeline.getAttributeLocation(key), 
                    value, 
                    gl.FLOAT, 
                    gl.FALSE, 
                    this.vertexByRow * Float32Array.BYTES_PER_ELEMENT, 
                    offset * Float32Array.BYTES_PER_ELEMENT
                );

                gl.enableVertexAttribArray(pipeline.getAttributeLocation(key));

                offset += value;
            }
            
            if(this.submeshes[i].materialIndex > -1){
                var bufferBase = this.materials[this.submeshes[i].materialIndex].getBuffer(pipeline, "u_material");

                if(bufferBase != null) {
                    gl.bindBufferBase(
                            gl.UNIFORM_BUFFER, 
                            this.materials[this.submeshes[i].materialIndex].getBindingPoint(), 
                            this.materials[this.submeshes[i].materialIndex].getBuffer(pipeline, "u_material")
                    );
                
                    var iSampler = 0;
                    while(pipeline.getUniformLocation("u_sampler" + iSampler) !== undefined && this.materials[this.submeshes[i].materialIndex].hasTexture()){
                        if(this.textures[this.materials[this.submeshes[i].materialIndex].diffuseTextureIndex].getWebGLTexture() == null)
                            break;

                        gl.activeTexture(gl.TEXTURE0 + iSampler);
                        gl.bindTexture(gl.TEXTURE_2D, this.textures[this.materials[this.submeshes[i].materialIndex].diffuseTextureIndex].getWebGLTexture());
                        /**
                         * TODO The 0 value must be dynamic. The engine have to decide the value.
                         */
                        gl.uniform1i(gl.getUniformLocation(pipeline.getProgram(), "u_sampler" + iSampler), 0);

                        iSampler++;
                    }
                }
            }

            const smoothNormalLoc = pipeline.getAttributeLocation("in_smoothNormal");

            if (smoothNormalLoc !== undefined && this.submeshes[i].getSmoothNormalBuffer() != null) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.submeshes[i].getSmoothNormalBuffer());
                gl.vertexAttribPointer(smoothNormalLoc, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(smoothNormalLoc);
            }

            const hasHardEdgesLoc = pipeline.getUniformLocation("u_hasHardEdges");
            if (hasHardEdgesLoc !== undefined) {
                pipeline.setUniformInt("u_hasHardEdges", this.submeshes[i].hasHardEdges() ? 1 : 0);
            }
    
            if(this.submeshes[i].getNumIndices() > 0){
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.submeshes[i].getIndexBuffer());
                //gl.drawElements(gl.LINE_LOOP, this.submeshes[i].getNumIndices(), gl.UNSIGNED_SHORT, 0)
                gl.drawElements(mode, this.submeshes[i].getNumIndices(), gl.UNSIGNED_SHORT, 0);
            } else {
                gl.drawArrays(gl.TRIANGLES, 0, this.submeshes[i].getNumVertices());
            }

            for (const [key, value] of Object.entries(this.vertexFormat)) {
                gl.disableVertexAttribArray(pipeline.getAttributeLocation(key));
            }
        }

        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindVertexArray(null);
        //gl.useProgram(null);

        //pipeline.unuse();
    }

    /**
     * Translate the mesh and its submeshes.
     * @param {Vector3} transform Displacement vector.
     */
    translate(transform){
        this.position[0] += transform[0];
        this.position[1] += transform[1];
        this.position[2] += transform[2];

        for(var i = 0; i < this.submeshes.length; i++){
            this.submeshes[i].translate(transform);
        }
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
     * @returns {WebGLVertexArrayObject} the vertex array object of the mesh
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
        var  deltaPos = m4.subtractVectors(position, this.position);
        this.translate(deltaPos);
        this.position = position;
    }

    /**
     * Get the position
     * @returns {Vector3} the position
     */
    getPosition(){
        return this.position;
    }

    /**
     * Get the number of rows by vertex
     * @returns {int} The number of rows by vertex
     */
    getVertexByRow(){
        return this.vertexByRow;
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
    setScale(scale){
        this.scale = scale;
    }

    /**
     * Add a material
     * @param {Material} material 
     */
    addMaterial(material){
        this.materials.push(material);
    }

    /**
     * Get the number of materials of the model
     * @returns {int} Number of materials of the model
     */
    getNumMaterials() {
        return this.materials.length;
    }

    /**
     * Add a new texture
     * @param {Texture} texture 
     */
    addTexture(texture){
        this.textures.push(texture);
    }

    /**
     * Get the total textures of the model
     * @returns {int} Number of the textures
     */
    getNumTextures(){
        return this.textures.length;
    }

    /**
     * Get a material by index
     * @param {int} index Index in tha array materials
     */
    getMaterial(index){
        return this.materials[index];
    }

    /**
     * Set a material for the mesh
     * @param {int} index 
     * @param {Material} material 
     */
    setMaterial(index, material){
        this.materials[index] = material;
    }

    /**
     * Get a submesh
     * @param {int} index 
     * @returns {StaticMesh}
     */
    getSubmesh(index){
        return this.submeshes[index];
    }

    /**
     * Get the forward vector
     * @returns {Vector3} Forward vector
     */
    getForward(){
        return this.forward;
    }

    /**
     * Get the right vector
     * @returns {Vector3} Right vector
     */
    getRight(){
        return this.right;
    }

    /**
     * Get the up vector
     * @returns {Vector3} Up vector
     */
    getUp(){
        return this.up;
    }

    /**
     * Rotate in a random axis
     * @param {Matrix4x4} m Rotated matrix
     */
    rotationAxis(m){
        this.axisRotation = m;
    }

    /**
     * Get the rotation in Y axis.
     * @returns {float} Rotation in Y axis.
     */
    getRotationInY(){
        return this.yRotation;
    }
     
    /**
     * Get the rotation in X axis.
     * @returns {float} Rotation in X axis.
     */
    getRotationInX(){
        return this.xRotation;
    }

    /**
     * Get the rotation in Z axis.
     * @returns {float} Rotation in Z axis.
     */
    getRotationInY(){
        return this.yRotation;
    }

    getRotationInZ(){
        return this.zRotation;
    }
}