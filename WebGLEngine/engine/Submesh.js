/**
 * Submesh part of the mesh
 * @author César Himura
 * @version 1.0
 */
class Submesh {
    constructor(){
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.numIndices = 0;
        this.numVertices = 0;
        this.materialIndex = -1;
        this.bounding = null;
        this.smoothNormalBuffer = null;
        this._hasHardEdges = false;
    }

    /**
     * Translate the mesh and its submeshes.
     * @param {Vector3} transform Displacement vector.
     */
    translate(transform){
        if(this.bounding != null){
            var position = this.bounding.getPosition();
            this.bounding.setPosition([
                position[0] + transform[0],
                position[1] + transform[1],
                position[2] + transform[2]
            ]);
        }
    }

    /**
     * Set the vertex buffer object
     * @param {WebGLBuffer} vbo 
     */
    setVertexBuffer(vbo){
        this.vertexBuffer = vbo;
    }

    /**
     * Set the index buffer object
     * @param {WebGLBuffer} vbo 
     */
    setIndexBuffer(ibo){
        this.indexBuffer = ibo;
    }

    /**
     * Get the vertex buffer
     * @returns {WebGLBuffer} vertex buffer
     */
    getVertexBuffer(){
        return this.vertexBuffer;
    }

    /**
     * Get the index buffer
     * @returns {WebGLBuffer} index buffer
     */
    getIndexBuffer(){
        return this.indexBuffer;
    }

    /**
     * Get the number of indices
     * @returns {int} number of indices
     */
    getNumIndices(){
        return this.numIndices;
    }

    /**
     * Get the number of vertices
     * @returns {int} number of vertices
     */
    getNumVertices(){
        return this.numVertices;
    }

    /**
     * Assigns the number of indices
     * @param {int} num Number of indices
     */
    setNumIndices(num){
        this.numIndices = num;
    }

    /**
     * Assigns the number of vertices
     * @param {int} num Number of vertices
     */
    setNumVertices(num){
        this.numVertices = num;
    }
    
    /**
     * Set the material index
     * @param {int} index 
     */
    setMaterialIndex(index){
        this.materialIndex = index;
    }

    /**
     * Set the bounding volume
     * @param {BoundingVolume} bounding 
     */
    setBoundingVolume(bounding){
        this.bounding = bounding;
    }

    /**
     * Get the bounding volume of the mesh
     * @returns {BoundingVolume} bounding
     */
    getBoundingVolume(){
        return this.bounding;
    }

    /**
     * Set the buffer with smooth normals.
     * @param {WebGLBuffer} buffer Buffer with smooth normals.
     */
    setSmoothNormalBuffer(buffer) {
        this.smoothNormalBuffer = buffer;
        this._hasHardEdges = true;
    }

    /**
     * Get the buffer with smooth normals.
     * @returns {WebGLBuffer} Buffer with smooth normals.
     */
    getSmoothNormalBuffer() {
        return this.smoothNormalBuffer;
    }

    /**
     * Set if the submesh has hard edges.
     * @param {boolean} hasHardEdges 
     */
    setHardEdges(hasHardEdges) {
        this._hasHardEdges = hasHardEdges;
    }

    /**
     * Get if the submesh has hard edges.
     * @returns {boolean} hasHardEdges.
     */
    hasHardEdges() {
        return this._hasHardEdges;
    }
}