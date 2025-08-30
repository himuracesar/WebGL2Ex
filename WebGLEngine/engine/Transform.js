include("/WebGLEngine/engine/pipeline/AxisPipeline.js");

/**
 * Transform 
 * @author César Himura
 * @version 1.0
 */
class Transform {
    constructor() {
        this.position = [0.0, 0.0, 0.0];
        this.scale = [1.0, 1.0, 1.0];
        this.yRotation = 0.0;
        this.xRotation = 0.0;
        this.zRotation = 0.0;
        this.lengthLine = 100;
        this.numPoints = 0;
        this.axisPipeline = new AxisPipeline();

        const radioConeArrow = 5.0;

        //X Line
        var verticesXLine = new Float32Array([
            0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
            this.lengthLine, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0
        ]);

        //Y Line
        var verticesYLine = new Float32Array([
            0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0,
            0.0, this.lengthLine, 0.0, 0.0, 1.0, 0.0, 1.0
        ]);

        //Z Line
        var verticesZLine = new Float32Array([
            0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, this.lengthLine, 0.0, 0.0, 1.0, 1.0
        ]);

        //X Cone
        var verticesXCone = [];
        var r = 0;
        for(var iRadio = radioConeArrow; iRadio >= 0; iRadio -= 0.1){
            for(var i = 0; i < 360; i++){
                verticesXCone.push(r, iRadio * Math.cos(webGLengine.degreeToRadian(i)), iRadio * Math.sin(webGLengine.degreeToRadian(i)), 1.0, 0.0, 0.0, 1.0);
                this.numPoints++;
            }
            r += 0.5;
        }

        //Y Cone
        var verticesYCone = [];
        r = 0;
        for(var iRadio = radioConeArrow; iRadio >= 0; iRadio -= 0.1){
            for(var i = 0; i < 360; i++){
                verticesYCone.push(iRadio * Math.cos(webGLengine.degreeToRadian(i)), r, iRadio * Math.sin(webGLengine.degreeToRadian(i)), 0.0, 1.0, 0.0, 1.0);
            }
            r += 0.5;
        }

        //Z Cone
        var verticesZCone = [];
        r = 0;
        for(var iRadio = radioConeArrow; iRadio >= 0; iRadio -= 0.1){
            for(var i = 0; i < 360; i++){
                verticesZCone.push(iRadio * Math.cos(webGLengine.degreeToRadian(i)), iRadio * Math.sin(webGLengine.degreeToRadian(i)), r, 0.0, 0.0, 1.0, 1.0);
            }
            r += 0.5;
        }

        this.vaoAxis = gl.createVertexArray();
        this.vboXLine = webGLengine.createBuffer(gl);
        this.vboYLine = webGLengine.createBuffer(gl);
        this.vboZLine = webGLengine.createBuffer(gl);
        this.vboXCone = webGLengine.createBuffer(gl);
        this.vboYCone = webGLengine.createBuffer(gl);
        this.vboZCone = webGLengine.createBuffer(gl);

        gl.bindVertexArray(this.vaoAxis);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboXLine);
        gl.bufferData(gl.ARRAY_BUFFER, verticesXLine, gl.STATIC_DRAW);
       
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboYLine);
        gl.bufferData(gl.ARRAY_BUFFER, verticesYLine, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboZLine);
        gl.bufferData(gl.ARRAY_BUFFER, verticesZLine, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboXCone);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesXCone), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboYCone);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesYCone), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboZCone);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesZCone), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    render() {
        this.axisPipeline.use();

        gl.uniformMatrix4fv(this.axisPipeline.getUniformLocation("u_mProj"), false, webGLengine.getActiveCamera().getProjectionMatrix());
        gl.uniformMatrix4fv(this.axisPipeline.getUniformLocation("u_mView"), false, webGLengine.getActiveCamera().getViewMatrix());
        gl.uniform3fv(this.axisPipeline.getUniformLocation("u_camera_position"), webGLengine.getActiveCamera().getPosition());

        //*********************************** LINES ****************************************
        //Red Line
        gl.bindVertexArray(this.vaoAxis);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboXLine);

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_position"), 3, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_position"));

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_color"), 4, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_color"));

        var mModel = m4.translation(this.position[0], this.position[1], this.position[2]);
        gl.uniformMatrix4fv(this.axisPipeline.getUniformLocation("u_mModel"), false, mModel);

        gl.drawArrays(gl.LINES, 0, 2);

        //Green Line
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboYLine);

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_position"), 3, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_position"));

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_color"), 4, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_color"));

        mModel = m4.translation(this.position[0], this.position[1], this.position[2]);
        gl.uniformMatrix4fv(this.axisPipeline.getUniformLocation("u_mModel"), false, mModel);

        gl.drawArrays(gl.LINES, 0, 2);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        //Blue Line
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboZLine);

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_position"), 3, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_position"));

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_color"), 4, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_color"));

        mModel = m4.translation(this.position[0], this.position[1], this.position[2]);
        gl.uniformMatrix4fv(this.axisPipeline.getUniformLocation("u_mModel"), false, mModel);

        gl.drawArrays(gl.LINES, 0, 2);

        //*********************************** CONES ****************************************
        //Red Cone
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboXCone);

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_position"), 3, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_position"));

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_color"), 4, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_color"));

        mModel = m4.translation(this.position[0] + this.lengthLine, this.position[1], this.position[2]);
        gl.uniformMatrix4fv(this.axisPipeline.getUniformLocation("u_mModel"), false, mModel);

        gl.drawArrays(gl.POINTS, 0, this.numPoints);

        //Green Cone
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboYCone);

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_position"), 3, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_position"));

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_color"), 4, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_color"));

        mModel = m4.translation(this.position[0], this.position[1] + this.lengthLine, this.position[2]);
        gl.uniformMatrix4fv(this.axisPipeline.getUniformLocation("u_mModel"), false, mModel);

        gl.drawArrays(gl.POINTS, 0, this.numPoints);

        //Blue Cone
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboZCone);

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_position"), 3, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_position"));

        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_color"), 4, gl.FLOAT, gl.FALSE, 7 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_color"));

        mModel = m4.translation(this.position[0], this.position[1], this.position[2] + this.lengthLine);
        gl.uniformMatrix4fv(this.axisPipeline.getUniformLocation("u_mModel"), false, mModel);

        gl.drawArrays(gl.POINTS, 0, this.numPoints);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}