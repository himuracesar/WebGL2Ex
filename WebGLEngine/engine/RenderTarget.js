/**
 * It's possible draw in a render target for techniques with multiple passes
 * 
 * @author César Himura
 * @version 1.0
 */
class RenderTarget {
    constructor(width, height, use, config = null){
        this.framebuffer = null;
        this.textures = [];
        this.depthBuffer = null;
        this.width = width;
        this.height = height;
        this.use = use;

        if(use == RenderTargetEnums.Use.ShadowMap){
            const shadowMap = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, shadowMap);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);

            // Parámetros de la textura
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            // 2. Crear Framebuffer Object (FBO)
            this.framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

            // Adjuntar la textura de profundidad al FBO
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadowMap, 0);

            var texture = new Texture();
            texture.setWebGLTexture(shadowMap);
            this.textures.push(texture);

            // Indicar a Webgl que no necesitamos una salida de color, solo profundidad
            gl.drawBuffers([gl.NONE]);
            gl.readBuffer(gl.NONE);
        } else if(use == RenderTargetEnums.Use.StencilBuffer){
            this.framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

            // Textura donde "hornearemos" el stencil
            const colorTex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, colorTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTex, 0);

            // Renderbuffer esencial para recibir el blit del stencil
            const dsBuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(gl.RENDERBUFFER, dsBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, width, height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, dsBuffer);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        //this.addTexture(null);

        // Create a renderbuffer object and Set its size and parameters
        /*this.depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

        // Create a frame buffer object (FBO)
        this.framebuffer = gl.createFramebuffer();

        // Attach the texture and the renderbuffer object to the FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textures[0].getWebglTexture(), 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);*/

        // Indicar a Webgl que no necesitamos una salida de color, solo profundidad
        /*gl.drawBuffers([gl.NONE]);
        gl.readBuffer(gl.NONE);*/

        // Check if FBO is configured correctly
        var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (gl.FRAMEBUFFER_COMPLETE !== e) {
            console.log('Frame buffer object is incomplete: ' + e.toString());
        }

        //this.framebuffer.texture = this.textures[0].getWebGLTexture(); // keep the required object

        // Unbind the buffer object
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }

    /**
     * Add a texture as attachment for the framebuffer. The texture is stored in an array, the index of the array corresponds to
     * the number of the attachment. Example:
     *      textures[0] = COLOR_ATTACHMENT0
     *      textures[1] = COLOR_ATTACHMENT1
     * @param {Object} config How to config the textures
     *      - type: int | float. For texparamer[i][f]
     *      - width: Width the texture
     *      - height: Height the texture
     *      - params: Correspond to the texparamer options in this order
     *          Target's name, Param's name, Param's value
     */
    addTexture(config = null) {
        if(config == null){
            config = {};
            config.type = "int";
            //config.params = [[Texture.TargetNames.Texture2D, Texture.ParamNames.MinFilter, Texture.ParamValues.Linear]]; //must be a matrix
            config.params = [[gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR]]; //must be a matrix
        }

        config.width = this.width;
        config.height = this.height;

        var texture = webglengine.createTexture(config);

        this.textures.push(texture);
    }

    /**
     * 
     * @param {int} index 
     * @returns {Texture} 
     */
    getTexture(index) {
        return this.textures[index];
    }

    /**
     * Get the framebuffer
     * @returns {WebglFramebuffer} Framebuffer where Webgl draw.
     */
    getFramebuffer() {
        return this.framebuffer;
    }

    /**
     * Get the width of the render target.
     * @returns {int} Width of the render target.
     */
    getWidth(){
        return this.width;
    }

    /**
     * Get the height of the render target.
     * @returns {int} Height of the render target.
     */
    getHeight(){
        return this.height;
    }

    /**
     * Set the width of the render target.
     * @param {int} width Width of the render target.
     */
    setWidth(width){
        this.width = width;
    }

    /**
     * Set the height of the render target.
     * @param {int} height Height of the render target.
     */
    setHeight(height){
        this.height = height;
    }

    /**
     * Bind the render target to draw in it.
     */
    bind(){
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    /**
     * The render target is not more active to draw.
     */
    unbind(){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
}