
/**
 * Point Light
 * @author César Himura
 * @version 1.0
 */
class PointLight {

    constructor(){
        this.buffer = null;
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.range = 1.0;
        this.kc = 0.0;
        this.kl = 0.0;
        this.kq = 0.0;
        this.intensity = 1.0;
        this.enabled = true;
        this.indexBuffer = 1;
    }

    /**
     * Get the color of the light
     * @returns {Vector4} Color of the light
     */
    getColor(){
        return this.color;
    }

    /**
     * Get the position of the light
     * @returns {Vector3} the position of the light
     */
    getPosition(){
        return this.position;
    }

    /**
     * Get if the light is on or off
     * @returns {boolean} On of off light
     */
    isEnabled(){
        return this.enabled;
    }

    /**
     * Get the intensity of the light
     * @returns {float} The intensity of the light
     */
    getIntensity(){
        return this.intensity;
    }

    /**
     * Set the color of the light
     * @param {Vector4} color Color of the light
     */
    setColor(color){
        this.color = color;
    }

    /**
     * Set the position of the light
     * @param {Vector3} position Position of the light
     */
    setPosition(position){
        this.position = position;
    }

    /**
     * Turn on or off the light
     * @param {boolean} enabled True or false to turn on of off the light
     */
    setEnabled(enabled){
        this.enabled = enabled;
    }

    /**
     * Set the intensity of the light
     * @param {float} intensity Intensity of the light
     */
    setIntensity(intensity){
        this.intensity = intensity;
    }

    /**
     * Get the constant attenuation
     * @returns Constant attenuation
     */
    getConstantAttenuation(){
        return this.kc;
    }

    /**
     * Get the lineal attenuation
     * @returns Lineal attenuation
     */
    getLinealAttenuation(){
        return this.kl;
    }

    /**
     * Get the quadratic attenuation
     * @returns Quadratic attenuation
     */
    getQuadraticAttenuation(){
        return this.kq;
    }

    /**
     * Set the constant attenuation
     * @param {float} kc 
     */
    setConstantAttenuation(kc){
        this.kc = kc;
    }

    /**
     * Set the lineal attenuation
     * @param {float} kl 
     */
    setLinealAttenuation(kl){
        this.kl = kl;
    }

    /**
     * Set the quadratic attenuation
     * @param {float} kq 
     */
    setQuadraticAttenuation(kq){
        this.kq = kq;
    }

    /**
     * Get the range
     * @returns {float} range
     */
    getRange(){
        return this.range;
    }

    /**
     * Set the range
     * @param {float} range 
     */
    setRange(range){
        this.range = range;
    }

    /**
     * Get the index buffer
     * @returns Index Buffer
     */
    getIndexBuffer(){
        return this.indexBuffer;
    }

    /**
     * Set the index buffer
     * @param {int} index 
     */
    setIndexBuffer(index){
        this.indexBuffer = index;
    }

    /**
     * Update the light buffer
     */
    updateBuffer(){
        if(this.buffer == null){
            this.buffer = webGLengine.createBuffer(gl);
        }

        gl.bindBufferBase(gl.UNIFORM_BUFFER, this.indexBuffer, this.buffer);
        // Upload data:
        gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array([
            this.position[0], this.position[1], this.position[2], 1.0,
            this.color[0], this.color[1], this.color[2], this.color[3],
            this.kc,
            this.kl,
            this.kq,
            this.range,
            this.enabled,
            this.intensity,
            0, 0 //padding
        ]), gl.DYNAMIC_DRAW);
    }

    /**
     * Get the light buffer
     * @returns light buffer
     */
    getBuffer(){
       this.updateBuffer();

        return this.buffer;
    }

}