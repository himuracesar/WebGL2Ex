/**
 * Bullet of the player
 * @author César Himura
 * @version 1.0
 */
class BulletPlayer extends Actor {
    
    static Status = Object.freeze({
        LIVE: 1,
        DEATH: 0
    });
    
    /**
     * Make a new bullet
     * @param {string} idMesh Name of the mesh represents the bullet
     */
    constructor(idMesh) {
        super();

        this.mesh = webGLengine.getResource(idMesh);
        this.position = [0.0, 0.0, 0.0];
        this.speed = 20.0;
        this.direction = [0.0, 0.0, 0.0];
        //this.birthTime = (new Date()).getTime();
        this.lifespan = 1000.0; //miliseconds
        this.id = "BP" + this.birthTime;
        this.life = 1.0;

        this.bounding = new SphereBounding({ radio: 8.0, position: this.position });

        this.status = BulletPlayer.Status.LIVE;
    }

    /**
     * Draw the bullet on the screen
     * @param {Pipeline} pipeline 
     */
    render(pipeline) {
        super.processMessages();

        if(this.status == BulletPlayer.Status.DEATH)
            return;

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
     * This is triggering when the object is on collision
     * @param {Object} object Object with 
     */
    onCollision(object) {
        super.onCollision(object);
        //debugger;
        console.log("bullet player collision!");
        this.status = BulletPlayer.Status.DEATH;
    }

    /**
     * Get status of the bullet
     * @returns {Status enum} Status of the bullet
     */
    getStatus(){
        return this.status;
    }
}