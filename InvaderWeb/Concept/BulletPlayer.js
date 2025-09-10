/**
 * Bullet of the player
 * @author César Himura
 * @version 1.0
 */
class BulletPlayer {
    /**
     * Make a new bullet
     * @param {string} idMesh Name of the mesh represents the bullet
     */
    constructor(idMesh) {
        this.mesh = webGLengine.getResource(idMesh);
        this.position = [0.0, 0.0, 0.0];
        this.speed = 20.0;
        this.direction = [0.0, 0.0, 0.0];
        this.birthTime = (new Date()).getTime();

        this.bounding = new SphereBounding({ radio: 8.0, position: this.position });
    }

    /**
     * Draw the bullet on the screen
     * @param {Pipeline} pipeline 
     */
    render(pipeline) {
        if(this.mesh != null){
            this.setPosition([
                this.direction[0] * this.speed + this.position[0], 
                0.0, 
                this.direction[2] * this.speed + this.position[2]
            ]);
            
            this.mesh.render(pipeline);
            //this.bounding.render();
        }
    }

    /**
     * Set the position
     * @param {Vector3} position 
     */
    setPosition(position){
        this.position = position;
        this.mesh.setPosition(this.position);
        this.bounding.setPosition(this.position);
    }

    /**
     * Set the direction
     * @param {Vector3} direction 
     */
    setDirection(direction){
        this.direction = direction;
    }

    /**
     * Get time when bullet born
     * @returns {long}
     */
    getBirthTime() {
        return this.birthTime;
    }
}