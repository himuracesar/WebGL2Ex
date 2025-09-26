
/**
 * Base class to create different actors on the scene
 * @author César Himura
 * @version 1.0
 */
class Actor {
    constructor() {
        this.id = "";
        this.mesh = null;
        this.position = [0.0, 0.0, 0.0];
        this.direction = [0.0, 0.0, 0.0];
        this.bounding = null;
        this.speed = 0.0;
        this.birthTime = (new Date()).getTime();
        this.lifespan = 0.0; //milliseconds
        this.life = 0;
    }

    /**
     * Get the ID
     * @returns {string} the ID of the object
     */
    getID() {
        return this.id;
    }

    /**
     * Update all logic  data
     */
    update(){

    }

    /**
     * Render function must be implemented in chidren classes
     */
    render(pipeline) {
        
    }

    /**
     * Translate the actor to a new position. The position is adds to the current position.
     * @param {Vector3} position 
     */
    translate([x, y, z]){
        this.position = [this.position[0] + x, this.position[1] + y, this.position[2] + z];
        if(this.mesh != null){
            this.setPosition(this.position);
            this.mesh.setPosition(this.position);
        }
    }

    /**
     * Place the actor in some position.
     * @param {Vector3} position 
     */
    setPosition(position){
        this.position = position;
        if(this.mesh != null){
            this.mesh.setPosition(this.position);
        }

        if(this.bounding != null){
            this.bounding.setPosition(this.position);
        }
    }

    /**
     * Get the current position of the actor.
     * @returns {Vector3} actor's position
     */
    getPosition(){
        return this.position;
    }

    /**
     * Get the forward vector
     * @returns {Vector3} Forward vector
     */
    getForward(){
        if(this.mesh != null)
            return this.mesh.getForward();

        return [0.0, 0.0, -1.0];
    }

    /**
     * Get the right vector
     * @returns {Vector3} Right vector
     */
    getRight(){
        if(this.mesh != null)
            return this.mesh.getRight();

        return [1.0, 0.0, 0.0];
    }

    /**
     * Get the up vector
     * @returns {Vector3} Up vector
     */
    getUp(){
        if(this.mesh != null)
            return this.mesh.getUp();

        return [0.0, 1.0, 0.0];
    }

    /**
     * Rotate the player in a random axis.
     * @param {Matrix4x4} m Matrix to rotate the player
     */
    rotationAxis(m){
        if(this.mesh != null)
            this.mesh.rotationAxis(m);
    }

    /**
     * Get the speed
     * @returns {float} speed of the player
     */
    getSpeed() {
        return this.speed;
    }

    /**
     * Get the bounding
     * @returns {BoundingVolume} the bounding
     */
    getBounding() {
        return this.bounding;
    }

    /**
     * Set the direction
     * @param {Vector3} direction 
     */
    setDirection(direction){
        this.direction = direction;
    }

    /**
     * Get the direction
     * @returns {Vector3} Direction
     */
    getDirection() {
        return this.direction;
    }

    /**
     * Get time when bullet born
     * @returns {long}
     */
    getBirthTime() {
        return this.birthTime;
    }

    /**
     * Get lifespan of the bullet
     * @returns {float} life span of the bullet
     */
    getLifespan() {
        return this.lifespan;
    }

    processMessages(){
        var messages = webGLengine.getMessages(this.id);
        
        if(messages === undefined)
            return;

        for(var i = 0; i < messages.length; i++){
            var msg = JSON.parse(messages[i]);
            if(msg.event == "collision")
                this.onCollision(webGLengine.getObjectInCollision(msg.from));
        }

        webGLengine.cleanMessagesForObject(this.id);
    }

    onCollision(object){
        //console.log("On Collision Actor");
        webGLengine.deleteObjectInCollision(this.id);
    }
}