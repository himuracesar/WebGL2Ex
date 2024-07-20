/**
 * Material
 * @author César Himura
 * @version 1.0
 */
class Material {

    constructor() {
        this.buffer = null;
        this.name = "";
        this.ambientColor = [0.0, 0.0, 0.0, 1.0];
        this.diffuseColor = [0.0, 0.0, 0.0, 1.0];
        this.specularColor = [0.0, 0.0, 0.0, 1.0];
        this.emissiveColor = [0.0, 0.0, 0.0, 1.0];
        this.specularPower = 0.0;
        this.transparency = 1;
        this.opticalDensity = 1; //Ni obj file
        this.diffuseTextureIndex = -1;
        this.normalMapIndex = -1;
        this.bumpMapIndex = -1;
        this.roughness = 0.0;
        this.metallness = 0.0;
        this._hasTexture = false;
        this.indexBuffer = -1;
        this.bindingPoint = -1;
    }

    /**
     * Set the name 
     * @param {string} name Name
     */
    setName(name){
        this.name = name;
    }

    /**
     * Set ambient color
     * @param {Vector4} color Ambient color
     */
    setAmbientColor(color){
        this.ambientColor = color;
    }

    /**
     * Set the diffuse color
     * @param {Vector4} color Diffuse color 
     */
    setDiffuseColor(color){
        this.diffuseColor = color;
    }

    /**
     * Set the emissive color
     * @param {Vector4} color Emissive color
     */
    setEmissiveColor(color){
        this.emissiveColor = color;
    }

    /**
     * Set the specular color
     * @param {Vector4} color 
     */
    setSpecularColor(color){
        this.specularColor = color;
    }

    /**
     * Set the specular power
     * @param {float} power Exponent
     */
    setSpecularPower(power){
        this.specularPower = power;
    }

    /**
     * Set the transparency
     * @param {float} tr 
     */
    setTransparency(tr){
        this.transparency = tr;
    }

    /**
     * Set the optical density
     * @param {float} od 
     */
    setOpticalDensity(od){
        this.opticalDensity = od;
    }

    /**
     * Set the index of the diffuse texture
     * @param {int} index Index
     */
    setDiffuseTextureIndex(index){
        this.diffuseTextureIndex = index;
    }

    /**
     * Set the index of normal map
     * @param {int} index Index
     */
    setNormalMapIndex(index){
        this.normalMapIndex = index;
    }

    /**
     * Set the inde of bump map
     * @param {int} index Index
     */
    setBumpMapIndex(index){
        this.normalMapIndex = index;
    }

    /**
     * Set the roughness
     * @param {float} roughness 
     */
    setRoughness(roughness){
        this.roughness = roughness;
    }

    /**
     * Set the metallness
     * @param {float} metallness 
     */
    setMetallness(metallness){
        this.metallness = metallness;
    }

    /**
     * Get the material name
     * @returns {string} material name
     */
    getName(){
        return this.name;
    }

    /**
     * Get the index buffer
     * @returns {int} The index buffer
     */
    getIndexBuffer(){
        return this.indexBuffer;
    }

    /**
     * Set if the material has texture
     * @returns {boolean} True if the material has texture
     */
    setHasTexture(b){
        this._hasTexture = b;
    }

    /**
     * @returns true If the material has texture false in the other hand
     */
    hasTexture(){
        return this._hasTexture;
    }

    /**
     * Set the binding point to the uniform buffer object
     * @param {int} bindingPoint Binding point
     */
    setBindingPoint(bindingPoint){
        this.bindingPoint = bindingPoint;
    }

    /**
     * Get the binding point of the uniform buffer object
     * @returns the binding point
     */
    getBindingPoint(){
        return this.bindingPoint;
    }

    /**
     * Get a uniform buffer to send the information about material to shader
     * @param pipeline Pipeline where the uniform block is
     * @param nameUbo Name of the uniform block in the program of the pipeline
     * @returns {WebGLBuffer} Uniform buffer to send the information to shader
     */
    getBuffer(pipeline, nameUbo){
        if(this.bindingPoint == -1){
            console.log("binding point = " + this.bindingPoint);
            return null;
        }

        if(this.buffer == null){
            this.buffer = webGLengine.createBuffer(gl);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, this.bindingPoint, this.buffer);
            gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array([
                this.diffuseColor[0], this.diffuseColor[1], this.diffuseColor[2], this.diffuseColor[3],
                this.specularColor[0], this.specularColor[1], this.specularColor[2], this.specularColor[3],
                this.ambientColor[0], this.ambientColor[1], this.ambientColor[2], this.ambientColor[3],
                this.emissiveColor[0], this.emissiveColor[1], this.emissiveColor[2], this.emissiveColor[3],
                this.specularPower,
                this.transparency,
                this.opticalDensity, 
                this.roughness,
                this.metallness,
                this._hasTexture ? 1 : 0, 
                0, 0 //padding
            ]), gl.DYNAMIC_DRAW);

            this.indexBuffer = gl.getUniformBlockIndex(pipeline.getProgram(), nameUbo);
            gl.uniformBlockBinding(pipeline.getProgram(), this.indexBuffer, this.bindingPoint);

            gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        }

        return this.buffer;
    }
}