/**
 * Directional Light
 * @author César Himura
 * @version 1.0
 */
class DirectionalLight {
    
    constructor(){
        this.buffer = null;
        this.color = [1.0, 1.0, 1.0, 1.0];
	    this.direction = [1.0, -1.0, -1.0, 0.0];
	    this.enabled = true;
	    this.intensity = 1.0;
    }

    /**
     * Get the color of the light
     * @returns {Vector4} Color of the light
     */
    getColor(){
        return this.color;
    }

    /**
     * Get the direction of the light
     * @returns {Vector3} the direction of the light
     */
    getDirection(){
        return this.direction;
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
     * Set the direction of the light
     * @param {Vector3} direction Direction of the light
     */
    setDirection(direction){
        this.direction = direction;
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

    updateBuffer(){
        if(this.buffer == null){
            this.buffer = webGLengine.createBuffer(gl);
        }

        gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, this.buffer);
        // Upload data:
        gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array([
            this.direction[0], this.direction[1], this.direction[2], this.direction[3],
            this.color[0], this.color[1], this.color[2], this.color[3],
            this.enabled,
            this.intensity,
            0, 0 //padding
        ]), gl.DYNAMIC_DRAW);
    }

    getBuffer(){
        /*
        if(this.buffer == null){
            this.buffer = webGLengine.createBuffer(gl);
            gl.bindBufferBase(gl.UNIFORM_BUFFER, 1, this.buffer);
            // Upload data:
            gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array([
                this.direction[0], this.direction[1], this.direction[2], this.direction[3],
                this.color[0], this.color[1], this.color[2], this.color[3],
                this.enabled,
                this.intensity,
                0, 0 //padding
            ]), gl.DYNAMIC_DRAW);
        }
        */
       this.updateBuffer();

        return this.buffer;
    }
}