/**
 * Bounding sphere in other engines this is named "collider"
 * 
 * @author César Himura
 * @version 1.0
 */
class BoundingSphere extends BoundingVolume {
    /**
     * Create a sphere bounding according the configuration
     *      - radio = sphere's radio. if the radio is 0 this is calculate automatically with vmin and vmax
     *      - position = sphere's position
     *      - vmin = min vector position to calculate the radio
     *      - vmax = max vector position to calculate the radio
     * @param {Object} config 
     */
    constructor(config = {}){
        super(config.vmin || [0.0, 0.0, 0.0], config.vmax || [0.0, 0.0, 0.0]);

        this.radio = config.radio || 0.0;
        super.setPosition(config.position || [0.0, 0.0, 0.0]);

        this.type = BoundingVolumeEnums.Type.Sphere;

        if(this.radio == 0.0)
            this.computeBoundingSphere();

        //Only for debug
        this.mesh = null;
    }

    /**
     * Compute the sphere bounding from minimum and maximum vectors
     */
    computeBoundingSphere(){
        var vmin = super.getVectorMin();
        var vmax = super.getVectorMax();
        
	    var position = [
            (vmin[0] + vmax[0]) / 2.0,
            (vmin[1] + vmax[1]) / 2.0,
            (vmin[2] + vmax[2]) / 2.0,
        ];

	    this.radio = (Math.abs(vmax[0] - position[0]) + Math.abs(vmax[1] - position[1]) + Math.abs(vmax[2] - position[2])) / 3.0;

        super.setPosition(position);
    }

    /**
     * Get the radio of the sphere
     * @returns {float} Radio
     */
    getRadio(){
        return this.radio;
    }

    /**
     * Set the radio of the sphere
     * @param {float} radio 
     */
    setRadio(radio){
        this.radio = radio;
    }

    /**
     * Set the position
     * @param {Vector3} position Bounding's position
     */
    setPosition(position) {
        this.position = position;
        super.setPosition(position);

        if(this.mesh != null)
            this.mesh.setPosition(this.position);
    }

    /**
     * Render the bounding commonly is only for debug propose.
     * @param {Pipeline} pipeline 
     */
    render() {
        if(this.mesh == null) {
            var shape = new Shape();

            var descriptor = {};
            descriptor.radio = this.radio;
            descriptor.slices = 8;
            descriptor.stacks = 8;

            this.mesh = shape.createSphere(descriptor);
        }

        simplePipeline.use();
        simplePipeline.setColor([0.0, 1.0, 0.0, 1.0]);

        gl.uniformMatrix4fv(simplePipeline.getUniformLocation("u_mProj"), false, camera.getProjectionMatrix());
        gl.uniformMatrix4fv(simplePipeline.getUniformLocation("u_mView"), false, camera.getViewMatrix());
        gl.uniform3fv(simplePipeline.getUniformLocation("u_camera_position"), camera.getPosition());

        this.mesh.render(simplePipeline, RenderMode.LineLoop);
    }
}