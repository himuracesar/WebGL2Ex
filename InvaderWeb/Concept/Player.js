/**
 * Player of the game
 * @author César Himura
 * @version 1.0
 */
class Player{
    constructor(){
        this.mesh = null;
        this.position = [0.0, 0.0, 100.0];
        this.bullets = [];
        this.fireRate = 140.0; //milliseconds
        this.nextFire = 0.0;
        this.speed = 4.0;

        this.bounding = new SphereBounding({ radio: 20.0, position: this.position });

        var fnMesh = webGLengine.createMeshByObjFile(gl, "meshes/player.obj");
        fnMesh.then((staticMesh) => {
            this.mesh = staticMesh;
            this.mesh.setPosition(this.position);
        });
    }

    /**
     * Render the player
     * @param {Pipeline} pipeline 
     */
    render(pipeline){
        if(this.mesh != null)
            this.mesh.render(pipeline);

        /*this.mesh
            .then(() => {console.log("fulfilled");}) 
            .catch(() => {console.log("rejected");})*/
        if(this.bullets[0] != null){
            var t = (new Date()).getTime() - this.bullets[0].getBirthTime();
            if(t >= 1000.0){
                this.bullets[0] = null;
                this.bullets.shift();
            }
        }

        for(const bullet of this.bullets){
            bullet.render(pipeline);
        }

        this.bounding.render(axisPipeline);
    }

    /**
     * Translate the player to a new position. The position is adds to the current position.
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
     * Place the player in some position.
     * @param {Vector3} position 
     */
    setPosition(position){
        this.position = position;
        if(this.mesh != null){
            this.mesh.setPosition(this.position);
            this.bounding.setPosition(this.position);
        }
    }

    /**
     * Get the current position of the player.
     * @returns {Vector3} player's position
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
     * Shot a bullet
     */
    shot() {
        if((new Date()).getTime() > this.nextFire){
            this.nextFire = this.fireRate + (new Date()).getTime();

            var bullet = new BulletPlayer("bullet");
            bullet.setPosition(this.getPosition());
            bullet.setDirection(this.getForward());

            this.bullets.push(bullet);
        }
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
     * @returns the bounding
     */
    getBounding() {
        return this.bounding;
    }
}