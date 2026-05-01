
class DogGrid {
    constructor(){
        this.pipeline = new GridPipeline();

        this.vao = gl.createVertexArray();
    }

    render(camera){
        this.pipeline.use();

        this.pipeline.setUniformMatrix4x4("u_mProj", camera.getProjectionMatrix());
        this.pipeline.setUniformMatrix4x4("u_mView", camera.getViewMatrix());
        this.pipeline.setUniformVector3("u_cameraPos", camera.getPosition());
        this.pipeline.setUniformVector3("u_origin", [0.0, 0.0, 0.0]);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindVertexArray(null);

        gl.disable(gl.BLEND);

        this.pipeline.unuse();
    }
}