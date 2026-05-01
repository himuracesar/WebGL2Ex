
class DogGizmo {
    /**
     * Axis modes for the gizmos
     */
    AxisMode = Object.freeze({
        Translation : 0,
        Rotation : 1,
        Scale : 2
    });

    /**
     * Axes for the gizmos
     */
    Axis = Object.freeze({
        0: [1.0, 0.0, 0.0], // X axis
        1: [0.0, 1.0, 0.0], // Y axis
        2: [0.0, 0.0, 1.0]  // Z axis
    });

    constructor(){
        this.axisClicked = -1;
        this.t1 = 0;
        this.t2 = 0;
        this.numIndicesAxisTranslation = 0;
        this.numIndicesAxisScale = 0;
        this.numIndicesAxisRotation = 0;
        this.axisPosition = [0.0, 0.0, 0.0];
        this.axisScale = [1.0, 1.0, 1.0];
        this.axisRotation = [0.0, 0.0, 0.0];
        this.startAngle = 0.0;
        this.currentAngle = 0.0;

        this.axisPipeline = new AxisPipeline(gl);
        this.axisIdPipeline = new AxisIdPipeline(gl);

        this.currentAxisMode = this.AxisMode.Translation;

        this.axisGeometry = this.createAxis();
        this.numAxisIndices = this.axisGeometry.numIndices;
        
        this.axisVao = gl.createVertexArray();
        this.axisVbo = gl.createBuffer();
        this.colorVbo = gl.createBuffer();
        this.transformBufferInst = gl.createBuffer();
        
        gl.bindVertexArray(this.axisVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.axisVbo);
        gl.bufferData(gl.ARRAY_BUFFER, this.axisGeometry.vertices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(
            this.axisPipeline.getAttributeLocation("in_position"), 
            3, 
            gl.FLOAT, 
            gl.FALSE, 
            3 * Float32Array.BYTES_PER_ELEMENT, 
            0
        );

        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_position"));

        this.axisIbo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.axisIbo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.axisGeometry.indices, gl.STATIC_DRAW);


        /***************************************************************************************************
         * Instances
         * *************************************************************************************************/
        this.updateAxisData();

        //axisPipeline
        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_mModel"), 4, gl.FLOAT, gl.FALSE, 16 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_mModel") + 1, 4, gl.FLOAT, gl.FALSE, 16 * Float32Array.BYTES_PER_ELEMENT, 4 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_mModel") + 2, 4, gl.FLOAT, gl.FALSE, 16 * Float32Array.BYTES_PER_ELEMENT, 8 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribPointer(this.axisPipeline.getAttributeLocation("in_mModel") + 3, 4, gl.FLOAT, gl.FALSE, 16 * Float32Array.BYTES_PER_ELEMENT, 12 * Float32Array.BYTES_PER_ELEMENT);

        //axisPipeline
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_mModel"));
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_mModel") + 1);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_mModel") + 2);
        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_mModel") + 3);

        gl.vertexAttribDivisor(this.axisPipeline.getAttributeLocation("in_mModel"), 1);
        gl.vertexAttribDivisor(this.axisPipeline.getAttributeLocation("in_mModel") + 1, 1);
        gl.vertexAttribDivisor(this.axisPipeline.getAttributeLocation("in_mModel") + 2, 1);
        gl.vertexAttribDivisor(this.axisPipeline.getAttributeLocation("in_mModel") + 3, 1)

        //-- axisIdPipeline
        gl.vertexAttribPointer(this.axisIdPipeline.getAttributeLocation("in_mModel"), 4, gl.FLOAT, gl.FALSE, 16 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribPointer(this.axisIdPipeline.getAttributeLocation("in_mModel") + 1, 4, gl.FLOAT, gl.FALSE, 16 * Float32Array.BYTES_PER_ELEMENT, 4 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribPointer(this.axisIdPipeline.getAttributeLocation("in_mModel") + 2, 4, gl.FLOAT, gl.FALSE, 16 * Float32Array.BYTES_PER_ELEMENT, 8 * Float32Array.BYTES_PER_ELEMENT);
        gl.vertexAttribPointer(this.axisIdPipeline.getAttributeLocation("in_mModel") + 3, 4, gl.FLOAT, gl.FALSE, 16 * Float32Array.BYTES_PER_ELEMENT, 12 * Float32Array.BYTES_PER_ELEMENT);

        gl.enableVertexAttribArray(this.axisIdPipeline.getAttributeLocation("in_mModel"));
        gl.enableVertexAttribArray(this.axisIdPipeline.getAttributeLocation("in_mModel") + 1);
        gl.enableVertexAttribArray(this.axisIdPipeline.getAttributeLocation("in_mModel") + 2);
        gl.enableVertexAttribArray(this.axisIdPipeline.getAttributeLocation("in_mModel") + 3);

        gl.vertexAttribDivisor(this.axisIdPipeline.getAttributeLocation("in_mModel"), 1);
        gl.vertexAttribDivisor(this.axisIdPipeline.getAttributeLocation("in_mModel") + 1, 1);
        gl.vertexAttribDivisor(this.axisIdPipeline.getAttributeLocation("in_mModel") + 2, 1);
        gl.vertexAttribDivisor(this.axisIdPipeline.getAttributeLocation("in_mModel") + 3, 1);

        // color buffer
        var colors = [
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0
        ];

        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        //axisPipeline
        gl.vertexAttribPointer(
            this.axisPipeline.getAttributeLocation("in_color"), 
            4, 
            gl.FLOAT, 
            gl.FALSE, 
            4 * Float32Array.BYTES_PER_ELEMENT, 
            0
        );

        gl.enableVertexAttribArray(this.axisPipeline.getAttributeLocation("in_color"));

        gl.vertexAttribDivisor(this.axisPipeline.getAttributeLocation("in_color"), 1);

        //axisIdPipeline
        gl.vertexAttribPointer(
            this.axisIdPipeline.getAttributeLocation("in_color"), 
            4, 
            gl.FLOAT, 
            gl.FALSE, 
            4 * Float32Array.BYTES_PER_ELEMENT, 
            0
        );

        gl.enableVertexAttribArray(this.axisIdPipeline.getAttributeLocation("in_color"));

        gl.vertexAttribDivisor(this.axisIdPipeline.getAttributeLocation("in_color"), 1);
        
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    /**
     * Resets the gizmo state
     */
    reset(){
        this.axisClicked = -1;
    }

    /**
     * Sets the axis mode for the gizmo.
     * @param {AxisMode} mode - The axis mode to set.
     */
    setAxisMode(mode){
        this.currentAxisMode = mode;
    }

    /**
     * Create a cylinder mesh. The mesh is made from bottom to up in this way the pivot is at the bottom of the cylinder.
     * @param {Object} descriptor - Object with the following properties: height, bottomRadio, topRadio, stacks, slices, topCap.
     * @param {Array} vertices - Array to store the generated vertices.
     * @param {Array} indices - Array to store the generated indices.
     * @param {Array} basePosition - Optional array [x, y, z]
     */
    createCylinder(descriptor, vertices, indices, basePosition = [0.0, 0.0, 0.0]){
        var bi = vertices.length / 3;

        var stackHeight = descriptor.height / descriptor.stacks;

        // Amount to increment radio as we move up each stack level from bottom to top.
        var radioStep = (descriptor.topRadio - descriptor.bottomRadio) / descriptor.stacks;

        var ringCount = descriptor.stacks + 1;

        // Compute vertices for each stack ring starting at the bottom and moving up.
        for (var i = 0; i < ringCount; ++i)
        {
            //var y = -0.5 * descriptor.height + i * stackHeight;
            //var y = descriptor.height + i * stackHeight;
            var y = descriptor.height * i / descriptor.stacks;
            var r = descriptor.bottomRadio + i * radioStep;
    
            // vertices of ring
            var theta = 2.0 * Math.PI / descriptor.slices;
            for (var j = 0; j <= descriptor.slices; ++j)
            {
                var c = Math.cos(j * theta);
                var s = Math.sin(j * theta);

                //position
                vertices.push(r * c + basePosition[0]);
                vertices.push(y + basePosition[1]);
                vertices.push(r * s + basePosition[2]);
            }
        }

        // Add one because we duplicate the first and last vertex per ring
        // since the texture coordinates are different.
        var ringVertexCount = descriptor.slices + 1;

        // Compute indices for each stack.
        for (var i = 0; i < descriptor.stacks; ++i)
        {
            for (var j = 0; j < descriptor.slices; ++j)
            {
                indices.push(i * ringVertexCount + j + bi);
                indices.push((i + 1) * ringVertexCount + j + bi);
                indices.push((i + 1) * ringVertexCount + j + 1 + bi);

                indices.push(i * ringVertexCount + j + bi);
                indices.push((i + 1) * ringVertexCount + j + 1 + bi);
                indices.push(i * ringVertexCount + j + 1 + bi);
            }
        }
    }

    /**
     * Create a cube mesh. The mesh is centered in the middle of the cube.
     * @param {Object} descriptor - Object with the following properties: width, height, depth.
     * @param {Array} vertices - Array to store the generated vertices. The will push the new vertices at the end of the array.
     * @param {Array} indices - Array to store the generated indices. The will push the new indices at the end of the array.  
     * @param {Array} basePosition - Optional array [x, y, z] to set the position of the cube. The position is the center of the cube.
     */
    createCube(descriptor, vertices, indices, basePosition = [0.0, 0.0, 0.0]){
        var bi = vertices.length / 3; // base index for the vertices of the cube

        var w = descriptor.width / 2.0;
        var h = descriptor.height / 2.0;
        var d = descriptor.depth / 2.0;

        // Front face
        vertices.push(-w + basePosition[0], -h + basePosition[1], d + basePosition[2]);
        vertices.push(w + basePosition[0], -h + basePosition[1], d + basePosition[2]);
        vertices.push(w + basePosition[0], h + basePosition[1], d + basePosition[2]);
        vertices.push(-w + basePosition[0], h + basePosition[1], d + basePosition[2]);

        // Back face
        vertices.push(-w + basePosition[0], -h + basePosition[1], -d + basePosition[2]);
        vertices.push(w + basePosition[0], -h + basePosition[1], -d + basePosition[2]);
        vertices.push(w + basePosition[0], h + basePosition[1], -d + basePosition[2]);
        vertices.push(-w + basePosition[0], h + basePosition[1], -d + basePosition[2]);

        // Top face
        vertices.push(-w + basePosition[0], h + basePosition[1], d + basePosition[2]);
        vertices.push(w + basePosition[0], h + basePosition[1], d + basePosition[2]);
        vertices.push(w + basePosition[0], h + basePosition[1], -d + basePosition[2]);
        vertices.push(-w + basePosition[0], h + basePosition[1], -d + basePosition[2]);

        // Bottom face
        vertices.push(-w + basePosition[0], -h + basePosition[1], d + basePosition[2]);
        vertices.push(w + basePosition[0], -h + basePosition[1], d + basePosition[2]);
        vertices.push(w + basePosition[0], -h + basePosition[1], -d + basePosition[2]);
        vertices.push(-w + basePosition[0], -h + basePosition[1], -d + basePosition[2]);

        // Left face
        vertices.push(-w + basePosition[0], -h + basePosition[1], d + basePosition[2]);
        vertices.push(-w + basePosition[0], h + basePosition[1], d + basePosition[2]);
        vertices.push(-w + basePosition[0], h + basePosition[1], -d + basePosition[2]);
        vertices.push(-w + basePosition[0], -h + basePosition[1], -d + basePosition[2]);

        // Right face
        vertices.push(w + basePosition[0], -h + basePosition[1], d + basePosition[2]);
        vertices.push(w + basePosition[0], h + basePosition[1], d + basePosition[2]);
        vertices.push(w + basePosition[0], h + basePosition[1], -d + basePosition[2]);
        vertices.push(w + basePosition[0], -h + basePosition[1], -d + basePosition[2]);

        indices.push(
            //Front
            0 + bi, 1 + bi, 2 + bi, 0 + bi, 2 + bi, 3 + bi,
            //Right
            4 + bi, 5 + bi, 6 + bi, 4 + bi, 6 + bi, 7 + bi,
            //Back
            8 + bi, 9 + bi, 10 + bi, 8 + bi, 10 + bi, 11 + bi,
            //Left
            12 + bi, 13 + bi, 14 + bi, 12 + bi, 14 + bi, 15 + bi,
            //Top
            16 + bi, 17 + bi, 18 + bi, 16 + bi, 18 + bi, 19 + bi,
            //Bottom
            20 + bi, 21 + bi, 22 + bi, 20 + bi, 22 + bi, 23 + bi
        );
    }

    /**
     * Create a torus mesh. The mesh is centered in the middle of the torus.
     * @param {Object} descriptor - Object with the following properties: radio, tuberadio, radialSegments, tubularSegments.
     * @param {Array} vertices - Array to store the generated vertices. The will push the new vertices at the end of the array.
     * @param {Array} indices - Array to store the generated indices. The will push the new indices at the end of the array.  
     */
    createTorus(descriptor, vertices, indices){ 
        var bi = vertices.length / 3;

        // Generar vértices
        for (let j = 0; j <= descriptor.radialSegments; j++) {
            for (let i = 0; i <= descriptor.tubularSegments; i++) {
                const u = (i / descriptor.tubularSegments) * Math.PI * 2;
                const v = (j / descriptor.radialSegments) * Math.PI * 2;

                // Ecuaciones paramétricas del Toroide
                const x = (descriptor.radio + descriptor.tuberadio * Math.cos(v)) * Math.cos(u);
                const z = (descriptor.radio + descriptor.tuberadio * Math.cos(v)) * Math.sin(u);
                const y = descriptor.tuberadio * Math.sin(v);

                vertices.push(x, y, z);
            }
        }

        // Generar índices para los triángulos (Faces)
        for (let j = 1; j <= descriptor.radialSegments; j++) {
            for (let i = 1; i <= descriptor.tubularSegments; i++) {
                const a = (descriptor.tubularSegments + 1) * j + i - 1;
                const b = (descriptor.tubularSegments + 1) * (j - 1) + i - 1;
                const c = (descriptor.tubularSegments + 1) * (j - 1) + i;
                const d = (descriptor.tubularSegments + 1) * j + i;

                // Dos triángulos por cada segmento del tubo
                indices.push(a + bi, b + bi, d + bi);
                indices.push(b + bi, c + bi, d + bi);
            }
        }
    }

    /**
     * Creates a mesh for the gizmo with 3 cylinders: one for the axis and another for the cone at the end 
     * of the translation gizmo and a cube at the end of the scale gizmo.  
     * @returns {Object} Object with the following properties: vertices, indices, numVertices, numIndices.
     */
    createAxis(){
        var descriptor = {};
        var vertices = [];
        var indices = [];

        //create axis translation
        descriptor.height = 40.0;
        descriptor.bottomRadio = 2.0;
        descriptor.topRadio = 2.0;
        descriptor.stacks = 1;
        descriptor.slices = 16;
        descriptor.topCap = false;

        this.createCylinder(descriptor, vertices, indices);

        descriptor = {};
        descriptor.height = 20.0;
        descriptor.bottomRadio = 6.0;
        descriptor.topRadio = 0.0;
        descriptor.stacks = 1;
        descriptor.slices = 16;
        descriptor.topCap = false;

        this.createCylinder(descriptor, vertices, indices, [0.0, 40.0, 0.0]);

        this.numIndicesAxisTranslation = indices.length;

        //create axis scale
        descriptor = {};
        descriptor.height = 40.0;
        descriptor.bottomRadio = 2.0;
        descriptor.topRadio = 2.0;
        descriptor.stacks = 1;
        descriptor.slices = 16;
        descriptor.topCap = false;

        this.createCylinder(descriptor, vertices, indices);
        
        const radio = 10.0;

        descriptor = {};
        descriptor.width = radio;
        descriptor.height = radio;
        descriptor.depth = radio;

        this.createCube(descriptor, vertices, indices, [0.0, 40.0, 0.0]);

        this.numIndicesAxisScale = indices.length - this.numIndicesAxisTranslation;

        descriptor = {};
        descriptor.radio = 40.0;
        descriptor.tuberadio = 3.0;
        descriptor.radialSegments = 32;
        descriptor.tubularSegments = 16;

        this.createTorus(descriptor, vertices, indices);

        this.numIndicesAxisRotation = indices.length - (this.numIndicesAxisTranslation + this.numIndicesAxisScale);

        return {
            vertices: new Float32Array(vertices),
            indices: new Uint16Array(indices),
            numVertices : vertices.length / 3,
            numIndices : indices.length
        };
    }
    
    /**
     * Updates the transformation matrices for the axis instances and uploads them to the GPU.
     */
    updateAxisData(){
        const numInstances = 3;
        const matrices = [];
        var transformData = new Float32Array(16 * numInstances);
        for (let i = 0; i < numInstances; ++i) {
            //var mModel = m4.translation(transformInstances[i * 3], transformInstances[i * 3 + 1], transformInstances[i * 3 + 2]);
            const byteOffsetToMatrix = i * 16 * 4;
            const numFloatsForView = 16;
            matrices.push(new Float32Array(
                transformData.buffer,
                byteOffsetToMatrix,
                numFloatsForView));
        }

        // update all the matrices
        matrices.forEach((mat, ndx) => {
            let mPos = m4.translation(this.axisPosition[0], this.axisPosition[1], this.axisPosition[2]);
            let mRot = m4.identity();

            switch (ndx) {
                case 0: // X axis
                    mRot = m4.zRotation(-Math.PI / 2.0);
                    break;
                case 1: // Y axis
                    mRot = m4.identity();
                    break;
                case 2: // Z axis
                    mRot = m4.xRotation(Math.PI / 2.0);
                    break;
            }

            const finalMat = m4.multiply(mPos, mRot);

            mat.set(finalMat);
        });
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBufferInst);
        gl.bufferData(gl.ARRAY_BUFFER, transformData, gl.DYNAMIC_DRAW);
    }

    /**
     * Calculates the closest point on the selected axis to the mouse ray.
     * @param {Vector3} axisPosition - Position of the axis (gizmo).
     * @param {int} axisSelected - Index of the selected axis (0: X, 1: Y, 2: Z).
     * @return {float} The closest point on the axis to the mouse ray.
     */ 
    getClosestPointOnAxis(axisPosition, axisSelected) {
        const axisDirs = [
            [1.0, 0.0, 0.0], // X axis
            [0.0, 1.0, 0.0], // Y axis
            [0.0, 0.0, 1.0]  // Z axis
        ];

        const ray = webGLengine.pickingRay(mouse.x, mouse.y, gl.canvas.width, gl.canvas.height, camera.getViewMatrix(), camera.getProjectionMatrix());

        const n = m4.cross(ray.getDirection(), m4.cross(axisDirs[axisSelected], ray.getDirection()));
        const denominator = m4.dot(axisDirs[axisSelected], n);
        
        if (Math.abs(denominator) < 0.0001) 
            return 0; // Evitar división por cero

        const t = m4.dot(m4.subtractVectors(ray.getOrigin(), axisPosition), n) / denominator;

        return t;
    }

     /**
     * @param {Vector3} axisPosition - Position of the axis (gizmo).
     * @param {Vector3} axisRotation - Axis of rotation (Normal of the plane for rotation gizmo, or direction of the axis for translation/scale gizmo).
     * @return {Vector3|null} The point of intersection between the mouse ray and the plane defined by axisPosition and axisRotation, or null if there is no intersection.
     */
    intersectRayPlane(axisPosition, axisRotation) {
        var ray = webGLengine.pickingRay(mouse.x, mouse.y, gl.canvas.width, gl.canvas.height, camera.getViewMatrix(), camera.getProjectionMatrix());
        
        const denom = m4.dot(axisRotation, ray.getDirection());
        
        //If the denominator is close to 0, the ray is parallel to the plane
        if (Math.abs(denom) < 0.0001) 
            return null;

        const t = m4.dot(m4.subtractVectors(axisPosition, ray.getOrigin()), axisRotation) / denom;
        
        if (t < 0) 
            return null; // The plane is behind the camera

        //Point of intersection: P = Origin + t * Dir
        return m4.addVectors(ray.getOrigin(), m4.scaleVector(ray.getDirection(), t));
    }

    /**
     * Calculates the angle of a vector on a plane defined by its normal (axisRotation) using atan2. 
     * This is used for the rotation gizmo to calculate the angle of rotation based * on the mouse movement.
     * @param {Vector3} vector - The vector to calculate the angle for (from the center of the object to the point where we touch the plane).
     * @param {Vector3} axisRotation - The normal of the plane for the rotation gizmo.
     * @return {float} The angle of the vector on the plane in radians.
     */
    getAngleOnPlane(vector, axisRotation) {
        //We need two axes perpendicular to the normal to create a 2D space. We can use the cross product to find these axes.
        //If the axisRotation is close to Y, we can use X as tangent, otherwise we can use the cross product with Y to find the tangent. The bitangent is the cross product of the normal and the tangent.
        let tangent, bitangent;
        if (Math.abs(axisRotation[1]) > 0.9) {
            tangent = [1, 0, 0]; // X
        } else {
            tangent = m4.normalize(m4.cross(axisRotation, [0, 1, 0]));
        }
        
        bitangent = m4.cross(axisRotation, tangent);

        const x = m4.dot(vector, tangent);
        const y = m4.dot(vector, bitangent);
        
        return Math.atan2(y, x);
    }


    /**
     * Computes the angle of rotation based on the mouse movement for the rotation gizmo. It calculates the point of intersection between the mouse ray and the plane defined by * the * axis position and normal, then calculates the angle of this point with respect to the local axes of the plane.
     * @return {float} The current angle of rotation in radians.
     */
    computeAngle(){
        if(this.axisClicked > -1 && this.currentAxisMode == this.AxisMode.Rotation){
            const axisNormal = this.Axis[this.axisClicked]; 
            const hitPoint = this.intersectRayPlane(this.axisPosition, axisNormal);

            if (hitPoint) {
                //Vector from the center of the object to the point where we touch the plane
                const currentVector = m4.normalize(m4.subtractVectors(hitPoint, this.axisPosition));
                
                //Now we calculate the angle of this vector with respect to the local axes of the plane
                const currentAngle = this.getAngleOnPlane(currentVector, axisNormal);
                //console.log("Current angle on plane: " + currentAngle);
                return currentAngle;
            }

            return 0.0;
        }
    }

    /**
     * Computes the movement of the gizmo based on the mouse movement. For translation and scale gizmos, 
     * it calculates the closest point on the selected axis to the mouse ray and *updates the position or 
     * scale accordingly. For rotation gizmo, it calculates the current angle of rotation based on the mouse movement and updates the rotation accordingly.
     * @returns 
     */
    computeMovement(){
        if(this.axisClicked == -1)
            return false;

        if(this.axisClicked != -1 && this.currentAxisMode != this.AxisMode.Rotation){
            const t2 = this.getClosestPointOnAxis(this.axisPosition, this.axisClicked);

            const delta = t2 - this.t1;

            if(this.currentAxisMode == this.AxisMode.Translation)
                this.axisPosition[this.axisClicked] += delta;
            else if(this.currentAxisMode == this.AxisMode.Scale)
                this.axisScale[this.axisClicked] += delta * 0.01; // Smooth scaling

            console.log("Axis position: " + this.axisPosition);
            console.log("Axis scale: " + this.axisScale);

            this.updateAxisData();
        } else if(this.axisClicked != -1 && this.currentAxisMode == this.AxisMode.Rotation){
            this.currentAngle = this.computeAngle();

            this.axisRotation[this.axisClicked] = this.currentAngle - this.startAngle; // The change in rotation is (currentAngle - startAngle)
            console.log("Axis rotation: " + this.axisRotation);
        }

        return true;
    }

    checkAxisClicked(renderTarget){
        if(this.axisClicked == -1) {// renderTarget != null){
            const pixel = new Uint8Array(4);
            
            renderTarget.bind();

            // Invert Y because WebGL starts from the bottom and the DOM from the top
            gl.readPixels(mouse.x, gl.canvas.height - mouse.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
            
            if(pixel[0] > 0) 
                this.axisClicked = 0; // X axis
            else if(pixel[1] > 0) 
                this.axisClicked = 1; // Y axis
            else if(pixel[2] > 0) 
                this.axisClicked = 2; // Z axis

            console.log("Clicked pixel RGBA: " + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ", " + pixel[3]);

            if(this.axisClicked !== -1 && this.currentAxisMode != this.AxisMode.Rotation){
                this.t1 = this.getClosestPointOnAxis(this.axisPosition, this.axisClicked);
            } else if(this.currentAxisMode == this.AxisMode.Rotation){
                this.startAngle = this.computeAngle();
            }

            renderTarget.unbind();
        }
    }

    //--------------------------------- Render ---------------------------------------
    render(camera, renderTarget){
        renderTarget.bind();
        
        gl.viewport(0, 0, renderTarget.getWidth(), renderTarget.getHeight());
        gl.depthMask(true);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.axisIdPipeline.use();

        gl.disable(gl.CULL_FACE);
        /*gl.disable(gl.BLEND);
        gl.disable(gl.DITHER);*/

        gl.bindVertexArray(this.axisVao);

        this.axisIdPipeline.setUniformMatrix4x4("u_mProj", camera.getProjectionMatrix());
        this.axisIdPipeline.setUniformMatrix4x4("u_mView", camera.getViewMatrix());

        if(this.currentAxisMode == this.AxisMode.Translation)
            gl.drawElementsInstanced(gl.TRIANGLES, this.numIndicesAxisTranslation, gl.UNSIGNED_SHORT, 0, 3);
        else if(this.currentAxisMode == this.AxisMode.Scale)
            gl.drawElementsInstanced(gl.TRIANGLES, this.numIndicesAxisScale, gl.UNSIGNED_SHORT, 2 * this.numIndicesAxisTranslation, 3);
        else if(this.currentAxisMode == this.AxisMode.Rotation)
            gl.drawElementsInstanced(gl.TRIANGLES, this.numIndicesAxisRotation, gl.UNSIGNED_SHORT, 2 * (this.numIndicesAxisTranslation + this.numIndicesAxisScale), 3);

        gl.bindVertexArray(null);
        
        /*if(this.axisClicked == -1 && mouse.down) {// renderTarget != null){
            const pixel = new Uint8Array(4);

            // Invert Y because WebGL starts from the bottom and the DOM from the top
            gl.readPixels(mouse.x, gl.canvas.height - mouse.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
            
            if(pixel[0] > 0) 
                this.axisClicked = 0; // X axis
            else if(pixel[1] > 0) 
                this.axisClicked = 1; // Y axis
            else if(pixel[2] > 0) 
                this.axisClicked = 2; // Z axis

            console.log("Clicked pixel RGBA: " + pixel[0] + ", " + pixel[1] + ", " + pixel[2] + ", " + pixel[3]);

            if(this.axisClicked !== -1 && this.currentAxisMode != this.AxisMode.Rotation){
                this.t1 = this.getClosestPointOnAxis(this.axisPosition, this.axisClicked);
            } else if(this.currentAxisMode == this.AxisMode.Rotation){
                this.startAngle = this.computeAngle();
            }
        }*/

        gl.enable(gl.CULL_FACE);
        /*gl.enable(gl.BLEND);
        gl.enable(gl.DITHER);*/

        this.axisIdPipeline.unuse();

        renderTarget.unbind();

        this.axisPipeline.use();
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);

        gl.bindVertexArray(this.axisVao);
        
        this.axisPipeline.setUniformMatrix4x4("u_mProj", camera.getProjectionMatrix());
        this.axisPipeline.setUniformMatrix4x4("u_mView", camera.getViewMatrix());
        this.axisPipeline.setUniformInt("u_highlightAxis", this.axisClicked);

        if(this.currentAxisMode == this.AxisMode.Translation)
            gl.drawElementsInstanced(gl.TRIANGLES, this.numIndicesAxisTranslation, gl.UNSIGNED_SHORT, 0, 3);
        else if(this.currentAxisMode == this.AxisMode.Scale)
            gl.drawElementsInstanced(gl.TRIANGLES, this.numIndicesAxisScale, gl.UNSIGNED_SHORT, 2 * this.numIndicesAxisTranslation, 3);
        else if(this.currentAxisMode == this.AxisMode.Rotation)
            gl.drawElementsInstanced(gl.TRIANGLES, this.numIndicesAxisRotation, gl.UNSIGNED_SHORT, 2 * (this.numIndicesAxisTranslation + this.numIndicesAxisScale), 3);
       
        gl.bindVertexArray(null);
        
        this.axisPipeline.unuse();

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
    }
}