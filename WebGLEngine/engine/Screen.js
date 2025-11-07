/**
 * This component is very useful to debug. In the screen you can render a texture in this way
 * we can check render technigques that have more than one step.
 * 
 * @author César Himura
 * @version 1.0
 */
class Screen {
    constructor(width, height) {
        this.position = [0.0, 0.0, 0.0];
        this.mModel = m4.translation(this.position[0], this.position[1], this.position[2]);
        this.mOrtho = m4.orthographic(
            0, gl.canvas.width,    // left, right
            gl.canvas.height, 0,   // bottom, top (invertido para origen arriba)
            -1, 1                  // near, far
        );

        this.texture = null;
        this.visible = true;

        const x1 = 0.0;
        const x2 = width;
        const y1 = 0.0;
        const y2 = height;

        this.vb = webGLengine.createBuffer(gl);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1, 0.0, 0.0, 0.0,
            x1, y2, 0.0, 0.0, 1.0,
            x2, y1, 0.0, 1.0, 0.0,
            x2, y1, 0.0, 1.0, 0.0,
            x1, y2, 0.0, 0.0, 1.0,
            x2, y2, 0.0, 1.0, 1.0
        ]), gl.STATIC_DRAW);
    }

    /**
     * Update all the logic values.
     */
    update(){
        if(!this.visible)
            return;

        this.mModel = m4.translation(this.position[0], this.position[1], this.position[2]);
    }

    /**
     * Draw the screen in the HTML canvas.
     * @param {Pipeline} pipeline 
     */
    render(pipeline){
        if(!this.visible)
            return;

        gl.disable(gl.DEPTH_TEST); // IMPORTANTE: Deshabilita para que siempre esté al frente

        pipeline.use();
       
        gl.uniformMatrix4fv(pipeline.getUniformLocation("u_mOrtho"), false, this.mOrtho);
        gl.uniformMatrix4fv(pipeline.getUniformLocation("u_mModel"), false, this.mModel);

        if(this.texture != null){
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture.getWebGLTexture());
            gl.uniform1i(pipeline.getUniformLocation("u_texture"), 0);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
        gl.vertexAttribPointer(pipeline.getAttributeLocation("in_position"), 3, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(pipeline.getAttributeLocation("in_position"));

        gl.vertexAttribPointer(pipeline.getAttributeLocation("in_texcoord"), 2, gl.FLOAT, gl.FALSE, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(pipeline.getAttributeLocation("in_texcoord"));

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    /**
     * Set the position for the screen.
     * @param {Vector3} position 
     */
    setPosition(position){
        this.position = position;
    }

    /**
     * Set a texture to render in the screen
     * @param {Texture} texture Texture object of the engine.
     */
    setTexture(texture){
        this.texture = texture;
    }

    /**
     * Set if the component is visible (true) or not (false)
     * @param {bool} v Component visible
     */
    setVisible(v){
        this.visible = v;
    }
}